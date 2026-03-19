from __future__ import annotations

import re
from datetime import datetime, timedelta

from config import (
    AMOUNT_TOLERANCE,
    ATTESTATION_EXPIRY_WARNING_DAYS,
    OCR_CONFIDENCE_MIN,
    TVA_RATE_TOLERANCE,
    VALID_TVA_RATES,
)
from utils import (
    first_nested,
    first_non_blank,
    normalize_document_type,
    normalize_iban,
    normalize_siret,
    normalize_tva,
    parse_date,
    to_float,
)


class ValidationRules:

    def __init__(self, extraction: dict, document: dict):
        self.extraction = extraction or {}
        self.document = document or {}
        self.company = self.document.get("_company", {}) or {}
        self.anomalies = []

    def run(self) -> list:
        self._check_missing_fields()
        self._check_amount_math()
        self._check_tva_consistency()
        self._check_ocr_quality()
        self._check_siret_vs_company()
        self._check_siren_consistency()
        self._check_invoice_dates()
        self._check_attestation_expired()
        self._check_rib_vs_company()
        return self.anomalies

    def _add_anomaly(self, type_: str, severity: str, description: str):
        severity_value = severity.lower()
        if severity_value not in {"info", "warning", "error"}:
            severity_value = "warning"

        self.anomalies.append(
            {
                "type": type_,
                "severity": severity_value,
                "description": description,
            }
        )

    def _document_type(self) -> str:
        return normalize_document_type(self.extraction.get("documentType"))

    def _get_document_siret(self) -> str | None:
        return first_nested(
            self.extraction,
            [
                "invoiceData.issuerSiret",
                "invoiceData.siret",
                "attestationData.issuerSiret",
                "attestationData.siret",
                "extractedData.siret",
            ],
        )

    def _get_invoice_issue_date(self):
        return parse_date(
            first_nested(
                self.extraction,
                [
                    "invoiceData.issueDate",
                    "invoiceData.dateEmission",
                    "extractedData.issueDate",
                ],
            )
        )

    def _get_attestation_expiry_date(self):
        return parse_date(
            first_nested(
                self.extraction,
                [
                    "attestationData.expiryDate",
                    "attestationData.dateExpiration",
                    "extractedData.expiryDate",
                ],
            )
        )

    def _check_missing_fields(self):
        doc_type = self._document_type()

        required = {
            "invoice": [
                ("invoice number", ["invoiceData.invoiceNumber"]),
                (
                    "invoice issuer SIRET",
                    [
                        "invoiceData.issuerSiret",
                        "invoiceData.siret",
                        "extractedData.siret",
                    ],
                ),
                ("invoice amount HT", ["invoiceData.amount.ht"]),
                ("invoice amount TVA", ["invoiceData.amount.tva"]),
                ("invoice amount TTC", ["invoiceData.amount.ttc"]),
            ],
            "attestation_urssaf": [
                (
                    "attestation SIRET",
                    [
                        "attestationData.issuerSiret",
                        "attestationData.siret",
                        "extractedData.siret",
                    ],
                ),
                (
                    "attestation expiry date",
                    [
                        "attestationData.expiryDate",
                        "attestationData.dateExpiration",
                        "extractedData.expiryDate",
                    ],
                ),
            ],
            "attestation_siret": [
                (
                    "attestation SIRET",
                    [
                        "attestationData.issuerSiret",
                        "attestationData.siret",
                        "extractedData.siret",
                    ],
                )
            ],
            "kbis": [
                ("kbis SIRET", ["extractedData.siret"]),
            ],
            "rib": [
                ("RIB IBAN", ["ribData.iban", "extractedData.iban"]),
            ],
        }

        fields = required.get(doc_type, [])
        for field_label, candidates in fields:
            value = first_nested(self.extraction, candidates)
            if value is None or (isinstance(value, str) and value.strip() == ""):
                self._add_anomaly(
                    "MISSING_FIELD",
                    "error",
                    f"Missing mandatory field: {field_label}",
                )

    def _check_amount_math(self):
        if self._document_type() != "invoice":
            return

        ht = to_float(first_nested(self.extraction, ["invoiceData.amount.ht"]))
        tva = to_float(first_nested(self.extraction, ["invoiceData.amount.tva"]))
        ttc = to_float(first_nested(self.extraction, ["invoiceData.amount.ttc"]))

        if ht is None or tva is None or ttc is None:
            return

        expected_ttc = round(ht + tva, 2)
        if abs(expected_ttc - ttc) > AMOUNT_TOLERANCE:
            self._add_anomaly(
                "AMOUNT_MISMATCH",
                "error",
                f"Amount mismatch: HT {ht} + TVA {tva} = {expected_ttc}, got TTC {ttc}",
            )

    def _check_tva_consistency(self):
        if self._document_type() != "invoice":
            return

        invoice_tva_number = normalize_tva(
            first_nested(
                self.extraction,
                [
                    "invoiceData.issuerTva",
                    "extractedData.tva",
                ],
            )
        )
        company_tva_number = normalize_tva(self.company.get("tva"))

        if invoice_tva_number and not re.match(r"^(FR\d{11}|\d+(?:[.,]\d+)?%)$", invoice_tva_number):
            self._add_anomaly(
                "TVA_FORMAT_INVALID",
                "warning",
                f"Invalid TVA format: {invoice_tva_number}",
            )

        if invoice_tva_number and company_tva_number and invoice_tva_number != company_tva_number:
            self._add_anomaly(
                "TVA_MISMATCH_COMPANY",
                "error",
                f"Invoice TVA {invoice_tva_number} differs from company TVA {company_tva_number}",
            )

        ht = to_float(first_nested(self.extraction, ["invoiceData.amount.ht"]))
        tva_amount = to_float(first_nested(self.extraction, ["invoiceData.amount.tva"]))

        if ht is None or tva_amount is None or ht <= 0:
            return

        ratio = round((tva_amount / ht) * 100, 2)
        closest_rate = min(VALID_TVA_RATES, key=lambda candidate: abs(candidate - ratio))

        if abs(ratio - closest_rate) > TVA_RATE_TOLERANCE:
            self._add_anomaly(
                "TVA_INCOHERENT",
                "error",
                f"Unusual TVA rate: {ratio}% (closest legal rate {closest_rate}%)",
            )

    def _check_ocr_quality(self):
        confidence = first_non_blank(
            first_nested(self.extraction, ["qualityMetrics.confidence"]),
            self.document.get("confidence"),
            default=100,
        )
        confidence_value = to_float(confidence)
        if confidence_value is None:
            return

        if confidence_value < OCR_CONFIDENCE_MIN:
            self._add_anomaly(
                "OCR_QUALITY_LOW",
                "info",
                f"Low OCR confidence: {confidence_value}% (min {OCR_CONFIDENCE_MIN}%)",
            )

    def _check_siret_vs_company(self):
        siret_company = normalize_siret(self.company.get("siret"))
        siret_doc = normalize_siret(self._get_document_siret())

        if siret_company and siret_doc and siret_company != siret_doc:
            self._add_anomaly(
                "SIRET_MISMATCH",
                "error",
                f"Document SIRET {siret_doc} differs from company SIRET {siret_company}",
            )

    def _check_siren_consistency(self):
        siret_doc = normalize_siret(self._get_document_siret())
        siren_company = normalize_siret(self.company.get("siren"))
        siren_extracted = normalize_siret(first_nested(self.extraction, ["extractedData.siren"]))

        if siret_doc and siren_company and siret_doc[:9] != siren_company:
            self._add_anomaly(
                "SIREN_MISMATCH",
                "error",
                f"SIREN derived from SIRET ({siret_doc[:9]}) differs from company SIREN ({siren_company})",
            )

        if siret_doc and siren_extracted and siret_doc[:9] != siren_extracted:
            self._add_anomaly(
                "SIREN_MISMATCH",
                "warning",
                f"Extracted SIREN ({siren_extracted}) does not match document SIRET prefix ({siret_doc[:9]})",
            )

    def _check_invoice_dates(self):
        if self._document_type() != "invoice":
            return

        issue_date = self._get_invoice_issue_date()
        due_date = parse_date(first_nested(self.extraction, ["invoiceData.dueDate"]))
        now = datetime.now()

        if issue_date and issue_date > now + timedelta(days=1):
            self._add_anomaly(
                "FUTURE_ISSUE_DATE",
                "warning",
                f"Invoice issue date is in the future: {issue_date.date()}",
            )

        if issue_date and due_date and due_date < issue_date:
            self._add_anomaly(
                "DUE_BEFORE_ISSUE",
                "error",
                f"Invoice due date {due_date.date()} is before issue date {issue_date.date()}",
            )

    def _check_attestation_expired(self):
        doc_type = self._document_type()
        if not doc_type.startswith("attestation"):
            return

        date_expiration = self._get_attestation_expiry_date()
        if not date_expiration:
            return

        issue_date = parse_date(
            first_nested(
                self.extraction,
                [
                    "attestationData.issueDate",
                    "attestationData.dateEmission",
                    "extractedData.issueDate",
                ],
            )
        )
        now = datetime.now()

        if date_expiration < now:
            self._add_anomaly(
                "DATE_EXPIRATION",
                "warning",
                f"Attestation expired on {date_expiration.date()}",
            )
        elif date_expiration <= now + timedelta(days=ATTESTATION_EXPIRY_WARNING_DAYS):
            self._add_anomaly(
                "DATE_EXPIRATION_SOON",
                "info",
                f"Attestation expires soon on {date_expiration.date()}",
            )

        if issue_date and issue_date > date_expiration:
            self._add_anomaly(
                "ATTESTATION_DATE_INCOHERENT",
                "error",
                f"Attestation issue date {issue_date.date()} is after expiry date {date_expiration.date()}",
            )

    def _check_rib_vs_company(self):
        if self._document_type() != "rib":
            return

        iban_doc = normalize_iban(
            first_nested(
                self.extraction,
                ["ribData.iban", "extractedData.iban"],
            )
        )
        iban_company = normalize_iban(self.company.get("iban"))

        if iban_doc and not re.match(r"^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$", iban_doc):
            self._add_anomaly(
                "IBAN_FORMAT_INVALID",
                "warning",
                f"Invalid IBAN format: {iban_doc}",
            )

        if iban_doc and iban_company and iban_doc != iban_company:
            self._add_anomaly(
                "IBAN_MISMATCH",
                "error",
                f"RIB IBAN {iban_doc} differs from company IBAN {iban_company}",
            )