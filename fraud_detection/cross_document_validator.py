from __future__ import annotations

from bson import ObjectId
from bson.errors import InvalidId
from rapidfuzz import fuzz

from utils import (
    first_nested,
    normalize_document_type,
    normalize_siret,
    normalize_tva,
    parse_date,
    to_float,
)


class CrossDocumentValidator:

    def __init__(self, db):
        self.db = db
        self.anomalies = []

    def run(self, extraction: dict) -> list:
        self.anomalies = []

        extraction = extraction or {}

        # company est sur CuratedZone (extraction), pas sur RawZone (document)
        company_id = extraction.get("company")
        if not company_id:
            return []

        # Convertir en ObjectId si possible (le JSON envoie une string)
        try:
            company_oid = ObjectId(str(company_id))
        except (InvalidId, TypeError):
            company_oid = None

        # Chercher avec ObjectId ET string pour couvrir les deux cas
        query = {"company": {"$in": [company_oid, str(company_id)]} if company_oid else str(company_id)}
        related_extractions = list(self.db.curatedzones.find(query))

        company = (
            self.db.companies.find_one({"_id": company_oid})
            or self.db.companies.find_one({"_id": str(company_id)})
            or extraction.get("_company")
            or {}
        )

        self._check_tva_vs_company(extraction, company)
        self._check_company_name_similarity(extraction, company)
        self._check_duplicate_invoice(extraction, related_extractions)
        self._check_invoice_vs_attestation_siret(extraction, related_extractions)
        self._check_attestation_vs_invoices(extraction, related_extractions)
        self._check_date_ordering(extraction, related_extractions)
        self._check_amount_gap(extraction, related_extractions)

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

    def _doc_type(self, extraction: dict) -> str:
        return normalize_document_type(extraction.get("documentType"))

    def _doc_ref(self, extraction: dict) -> str | None:
        candidate = (
            extraction.get("document")
            or extraction.get("_doc_id")
            or extraction.get("_id")
        )
        return str(candidate) if candidate is not None else None

    def _is_same_document(self, extraction_a: dict, extraction_b: dict) -> bool:
        ref_a = self._doc_ref(extraction_a)
        ref_b = self._doc_ref(extraction_b)
        return bool(ref_a and ref_b and ref_a == ref_b)

    def _get_siret(self, extraction: dict) -> str | None:
        return normalize_siret(
            first_nested(
                extraction,
                [
                    "invoiceData.issuerSiret",
                    "invoiceData.siret",
                    "attestationData.issuerSiret",
                    "attestationData.siret",
                    "extractedData.siret",
                ],
            )
        )

    def _get_invoice_number(self, extraction: dict) -> str | None:
        value = first_nested(extraction, ["invoiceData.invoiceNumber"])
        return str(value).strip() if value is not None else None

    def _get_invoice_issue_date(self, extraction: dict):
        return parse_date(
            first_nested(
                extraction,
                [
                    "invoiceData.issueDate",
                    "invoiceData.dateEmission",
                    "extractedData.issueDate",
                ],
            )
        )

    def _get_quote_issue_date(self, extraction: dict):
        return parse_date(
            first_nested(
                extraction,
                [
                    "quoteData.issueDate",
                    "extractedData.issueDate",
                    "extractedData.dateEmission",
                ],
            )
        )

    def _get_attestation_expiry_date(self, extraction: dict):
        return parse_date(
            first_nested(
                extraction,
                [
                    "attestationData.expiryDate",
                    "attestationData.dateExpiration",
                    "extractedData.expiryDate",
                ],
            )
        )

    def _get_invoice_ht(self, extraction: dict) -> float | None:
        return to_float(first_nested(extraction, ["invoiceData.amount.ht"]))

    def _get_quote_ht(self, extraction: dict) -> float | None:
        return to_float(
            first_nested(
                extraction,
                [
                    "quoteData.amount.ht",
                    "extractedData.ht",
                ],
            )
        )

    def _get_related_quotes_for_invoice(self, extraction: dict, related: list) -> list:
        invoice_doc_ref = self._doc_ref(extraction)
        invoice_number = self._get_invoice_number(extraction)

        quotes = [item for item in related if self._doc_type(item) == "quote"]
        if not quotes:
            return []

        linked_quotes = []
        for quote in quotes:
            related_invoice_ref = first_nested(
                quote,
                [
                    "quoteData.relatedInvoice",
                    "extractedData.relatedInvoice",
                    "relatedInvoice",
                    "_related_invoice",
                ],
            )
            related_invoice_number = first_nested(
                quote,
                [
                    "quoteData.relatedInvoiceNumber",
                    "extractedData.relatedInvoiceNumber",
                ],
            )

            if invoice_doc_ref and related_invoice_ref and str(related_invoice_ref) == invoice_doc_ref:
                linked_quotes.append(quote)
                continue

            if invoice_number and related_invoice_number and str(related_invoice_number) == invoice_number:
                linked_quotes.append(quote)

        return linked_quotes if linked_quotes else quotes

    def _check_tva_vs_company(self, extraction: dict, company: dict):
        if self._doc_type(extraction) != "invoice":
            return

        invoice_tva = normalize_tva(
            first_nested(extraction, ["invoiceData.issuerTva", "extractedData.tva"])
        )
        company_tva = normalize_tva(company.get("tva"))

        if invoice_tva and company_tva and invoice_tva != company_tva:
            self._add_anomaly(
                "TVA_MISMATCH_COMPANY",
                "error",
                f"Invoice TVA {invoice_tva} differs from company TVA {company_tva}",
            )

    def _check_company_name_similarity(self, extraction: dict, company: dict):
        company_name = str(company.get("name") or "").strip()
        extracted_name = str(
            first_nested(
                extraction,
                [
                    "extractedData.companyName",
                    "invoiceData.issuer",
                    "attestationData.issuer",
                    "ribData.accountHolder",
                ],
            )
            or ""
        ).strip()

        if not company_name or not extracted_name:
            return

        score = fuzz.ratio(extracted_name.lower(), company_name.lower())
        if score < 75:
            self._add_anomaly(
                "NAME_MISMATCH",
                "warning",
                f"Extracted company name '{extracted_name}' is far from '{company_name}' (similarity {score:.0f}%)",
            )

    def _check_duplicate_invoice(self, extraction: dict, related: list):
        if self._doc_type(extraction) != "invoice":
            return

        invoice_number = self._get_invoice_number(extraction)
        if not invoice_number:
            return

        for other in related:
            if self._is_same_document(extraction, other):
                continue
            if self._doc_type(other) != "invoice":
                continue

            other_number = self._get_invoice_number(other)
            if other_number and other_number == invoice_number:
                self._add_anomaly(
                    "DUPLICATE_DOCUMENT",
                    "warning",
                    f"Duplicate invoice number detected: {invoice_number}",
                )
                break

    def _check_invoice_vs_attestation_siret(self, extraction: dict, related: list):
        if self._doc_type(extraction) != "invoice":
            return

        invoice_siret = self._get_siret(extraction)
        if not invoice_siret:
            return

        attestation_sirets = set()
        for other in related:
            if self._is_same_document(extraction, other):
                continue
            if not self._doc_type(other).startswith("attestation"):
                continue

            attestation_siret = self._get_siret(other)
            if attestation_siret:
                attestation_sirets.add(attestation_siret)

        for attestation_siret in attestation_sirets:
            if attestation_siret != invoice_siret:
                self._add_anomaly(
                    "SIRET_MISMATCH",
                    "error",
                    f"Invoice SIRET {invoice_siret} differs from attestation SIRET {attestation_siret}",
                )
                break

    def _check_attestation_vs_invoices(self, extraction: dict, related: list):
        doc_type = self._doc_type(extraction)

        if doc_type == "invoice":
            date_invoice = self._get_invoice_issue_date(extraction)
            if not date_invoice:
                return

            expiration_dates = []
            for other in related:
                if self._is_same_document(extraction, other):
                    continue
                if not self._doc_type(other).startswith("attestation"):
                    continue

                expiration_date = self._get_attestation_expiry_date(other)
                if expiration_date:
                    expiration_dates.append(expiration_date)

            if not expiration_dates:
                return

            latest_expiration = max(expiration_dates)
            if date_invoice > latest_expiration:
                self._add_anomaly(
                    "DATE_EXPIRATION",
                    "warning",
                    f"Invoice date {date_invoice.date()} is after latest attestation expiry {latest_expiration.date()}",
                )

        if doc_type.startswith("attestation"):
            expiration_date = self._get_attestation_expiry_date(extraction)
            if not expiration_date:
                return

            for other in related:
                if self._is_same_document(extraction, other):
                    continue
                if self._doc_type(other) != "invoice":
                    continue

                invoice_date = self._get_invoice_issue_date(other)
                if invoice_date and invoice_date > expiration_date:
                    self._add_anomaly(
                        "DATE_EXPIRATION",
                        "warning",
                        f"Invoice date {invoice_date.date()} is after attestation expiry {expiration_date.date()}",
                    )
                    break

    def _check_date_ordering(self, extraction: dict, related: list):
        if self._doc_type(extraction) != "invoice":
            return

        date_invoice = self._get_invoice_issue_date(extraction)
        if not date_invoice:
            return

        for quote in self._get_related_quotes_for_invoice(extraction, related):
            date_quote = self._get_quote_issue_date(quote)
            if date_quote and date_quote > date_invoice:
                self._add_anomaly(
                    "DATE_ORDERING",
                    "warning",
                    f"Quote date {date_quote.date()} is after invoice date {date_invoice.date()}",
                )
                break

    def _check_amount_gap(self, extraction: dict, related: list):
        if self._doc_type(extraction) != "invoice":
            return

        invoice_ht = self._get_invoice_ht(extraction)
        if invoice_ht is None or invoice_ht <= 0:
            return

        invoice_date = self._get_invoice_issue_date(extraction)
        quote_scores = []

        for quote in self._get_related_quotes_for_invoice(extraction, related):
            quote_ht = self._get_quote_ht(quote)
            if quote_ht is None or quote_ht <= 0:
                continue

            date_quote = self._get_quote_issue_date(quote)
            date_distance = (
                abs((invoice_date - date_quote).days)
                if invoice_date and date_quote
                else 9999
            )
            gap_ratio = abs(invoice_ht - quote_ht) / quote_ht
            quote_scores.append((date_distance, gap_ratio, quote_ht))

        if not quote_scores:
            return

        _, best_gap_ratio, best_quote_ht = min(quote_scores, key=lambda item: (item[0], item[1]))

        if best_gap_ratio > 0.30:
            self._add_anomaly(
                "AMOUNT_GAP",
                "warning",
                (
                    f"Large quote/invoice HT gap: quote {best_quote_ht} vs invoice {invoice_ht} "
                    f"({round(best_gap_ratio * 100)}% difference)"
                ),
            )