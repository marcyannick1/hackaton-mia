from __future__ import annotations

from datetime import datetime

from bson import ObjectId
from bson.errors import InvalidId

from anomaly_detection import AnomalyDetector
from config import FRAUD_SCORE_THRESHOLD, get_db
from cross_document_validator import CrossDocumentValidator
from feature_engineering import build_features
from utils import compute_rules_score, dedupe_anomalies, first_nested, normalize_document_type, parse_date
from validation_rules import ValidationRules


detector = AnomalyDetector()
db = get_db()


def _as_object_id(value):
    if isinstance(value, ObjectId):
        return value
    if value is None:
        return None
    try:
        return ObjectId(str(value))
    except (InvalidId, TypeError):
        return None


def _update_company_from_attestation(curated: dict, status: str, anomalies: list[dict]):
    doc_type = normalize_document_type(curated.get("documentType"))
    if not doc_type.startswith("attestation") and doc_type != "kbis":
        return

    company_id = curated.get("company")
    company_oid = _as_object_id(company_id)
    company_filter = {"_id": company_oid} if company_oid else {"_id": company_id}

    expiry_date = parse_date(
        first_nested(
            curated,
            [
                "attestationData.expiryDate",
                "attestationData.dateExpiration",
                "extractedData.expiryDate",
            ],
        )
    )

    attestation_type = str(first_nested(curated, ["attestationData.attestationType"]) or "").lower()
    if not attestation_type:
        if doc_type == "attestation_urssaf":
            attestation_type = "urssaf"
        elif doc_type == "kbis":
            attestation_type = "kbis"

    has_expired_attestation = any(
        item.get("type") == "DATE_EXPIRATION" and item.get("severity") in {"warning", "error"}
        for item in anomalies
    )

    compliance_status = "compliant"
    if status != "approved":
        compliance_status = "pending"
    if has_expired_attestation:
        compliance_status = "non-compliant"

    update_fields = {"complianceStatus": compliance_status}
    if expiry_date and attestation_type in {"urssaf", "kbis"}:
        update_fields[f"attestationExpiry.{attestation_type}"] = expiry_date

    db.companies.update_one(company_filter, {"$set": update_fields})


def process_extraction(curated_id: str) -> dict:
    """
    Point d'entree principal appele par Airflow.
    Prend l'_id d'un document CuratedZone, lance les validations
    et met a jour la collection curatedzones.
    """
    curated_oid = _as_object_id(curated_id)
    if curated_oid is None:
        raise ValueError(f"Invalid curated id: {curated_id}")

    curated = db.curatedzones.find_one({"_id": curated_oid})
    if curated is None:
        raise ValueError(f"CuratedZone not found: {curated_id}")

    # Attacher la fiche societe pour les checks de coherence
    company_ref = curated.get("company")
    if company_ref is not None:
        company_oid = _as_object_id(company_ref)
        company = db.companies.find_one({"_id": company_oid}) if company_oid else None
        if not company:
            company = db.companies.find_one({"_id": company_ref})
        if company:
            curated["_company"] = company

    # Validation single-document (SIRET, TVA, montants, dates...)
    # On passe curated comme extraction ET comme document car toutes
    # les infos sont dans CuratedZone (company via _company)
    rules = ValidationRules(curated, curated)
    single_doc_anomalies = rules.run()

    # Validation inter-documents (cross SIRET, expiration attestation...)
    cross_validator = CrossDocumentValidator(db)
    cross_doc_anomalies = cross_validator.run(curated)

    anomalies = dedupe_anomalies(single_doc_anomalies + cross_doc_anomalies)

    features = build_features(curated, curated, len(anomalies))
    ml_result = detector.predict(features)

    rules_score = compute_rules_score(anomalies)
    ml_score = float(ml_result.get("fraud_score") or 0.0)
    fraud_score = round(rules_score * 0.65 + ml_score * 0.35, 3)
    is_suspect = fraud_score >= FRAUD_SCORE_THRESHOLD

    has_error = any(item.get("severity") == "error" for item in anomalies)
    new_status = "in_review" if (has_error or is_suspect) else "approved"

    quality_note = (
        f"auto_fraud_score={fraud_score}; "
        f"anomaly_count={len(anomalies)}; "
        f"ml_is_anomaly={ml_result.get('is_anomaly', False)}"
    )

    # Mise a jour CuratedZone avec les resultats de validation
    db.curatedzones.update_one(
        {"_id": curated_oid},
        {
            "$set": {
                "inconsistencies": anomalies,
                "status": new_status,
                "reviewNotes": quality_note,
                "qualityMetrics.qualityNotes": quality_note,
            },
            "$push": {
                "processingLog": {
                    "timestamp": datetime.utcnow(),
                    "action": "fraud_validation",
                    "details": quality_note,
                }
            },
        },
    )

    # Mise a jour du statut RawZone associe
    raw_ref = curated.get("rawZone")
    raw_oid = _as_object_id(raw_ref)
    if raw_oid:
        db.rawzones.update_one(
            {"_id": raw_oid},
            {"$set": {"status": "completed"}}
        )

    # Mise a jour compliance societe si c'est une attestation
    _update_company_from_attestation(curated, new_status, anomalies)

    return {
        "curated_id": str(curated_oid),
        "fraud_score": fraud_score,
        "is_suspect": is_suspect,
        "status": new_status,
        "anomaly_count": len(anomalies),
        "ml_result": ml_result,
        "anomalies": anomalies,
    }
