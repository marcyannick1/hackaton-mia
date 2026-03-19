from datetime import datetime

from utils import first_nested, parse_date, to_float


def build_features(extraction: dict, document: dict, anomaly_count: int) -> list:
    extraction = extraction or {}
    document = document or {}

    ht = to_float(first_nested(extraction, ["invoiceData.amount.ht"])) or 0.0
    tva = to_float(first_nested(extraction, ["invoiceData.amount.tva"])) or 0.0
    ttc = to_float(first_nested(extraction, ["invoiceData.amount.ttc"])) or 0.0

    tva_ratio = (tva / ht) if ht > 0 else 0.0
    ttc_gap = abs((ht + tva) - ttc) if (ht or tva or ttc) else 0.0

    issue_date = parse_date(
        first_nested(
            extraction,
            [
                "invoiceData.issueDate",
                "invoiceData.dateEmission",
                "extractedData.issueDate",
            ],
        )
    )
    days_since_issue = (datetime.now() - issue_date).days if issue_date else 0

    expiry_date = parse_date(
        first_nested(
            extraction,
            [
                "attestationData.expiryDate",
                "attestationData.dateExpiration",
                "extractedData.expiryDate",
            ],
        )
    )
    days_to_expiry = (expiry_date - datetime.now()).days if expiry_date else 0

    confidence = (
        to_float(first_nested(extraction, ["qualityMetrics.confidence"]))
        or to_float(document.get("confidence"))
        or 100.0
    )

    return [
        ht,
        tva,
        ttc,
        tva_ratio,
        ttc_gap,
        days_since_issue,
        days_to_expiry,
        confidence,
        float(anomaly_count),
        float(int(ht > 100_000)),
        float(int(days_to_expiry < 0)),
    ]
