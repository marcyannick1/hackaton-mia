"""
Script de seed pour tester le cross-document validator.

Insere dans MongoDB :
- 1 societe (companies)
- 1 facture avec SIRET A  (curatedzones)
- 1 attestation URSSAF avec SIRET B different  (curatedzones)

=> Doit declencher SIRET_MISMATCH en cross-document.

Usage:
    python scripts/seed_test_data.py
"""

import sys
import json
from pathlib import Path
from datetime import datetime, timedelta

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from config import get_db

db = get_db()


def seed():
    # Nettoyage des donnees de test precedentes
    db.companies.delete_many({"name": "SOCIETE TEST SARL"})
    db.curatedzones.delete_many({"extractedData.companyName": "SOCIETE TEST SARL"})

    # 1. Creer la societe
    company = {
        "name": "SOCIETE TEST SARL",
        "siret": "11111111100001",
        "siren": "111111111",
        "tva": "FR11111111100",
        "iban": "FR7630006000011234567890189",
        "complianceStatus": "pending",
    }
    company_id = db.companies.insert_one(company).inserted_id
    print(f"Societe inseree : {company_id}")

    # 2. Facture avec SIRET A
    invoice = {
        "company": company_id,
        "documentType": "invoice",
        "extractionMethod": "ocr",
        "extractedData": {
            "companyName": "SOCIETE TEST SARL",
            "siret": "11111111100001",
        },
        "invoiceData": {
            "invoiceNumber": "F-TEST-001",
            "issuer": "SOCIETE TEST SARL",
            "issuerSiret": "11111111100001",
            "issuerTva": "FR11111111100",
            "amount": {"ht": 2000.0, "tva": 400.0, "ttc": 2400.0},
            "issueDate": datetime(2026, 2, 1),
            "dueDate": datetime(2026, 3, 1),
        },
        "qualityMetrics": {"confidence": 92},
        "status": "pending",
    }
    invoice_id = db.curatedzones.insert_one(invoice).inserted_id
    print(f"Facture inseree  : {invoice_id}")

    # 3. Attestation URSSAF avec SIRET B (different => SIRET_MISMATCH)
    attestation = {
        "company": company_id,
        "documentType": "attestation_urssaf",
        "extractionMethod": "ocr",
        "extractedData": {
            "companyName": "SOCIETE TEST SARL",
            "siret": "99999999900009",   # SIRET different !
            "expiryDate": datetime(2025, 6, 30),  # expiree !
        },
        "attestationData": {
            "attestationType": "urssaf",
            "issuerSiret": "99999999900009",
            "issueDate": datetime(2024, 7, 1),
            "expiryDate": datetime(2025, 6, 30),  # expiree
            "status": "expired",
        },
        "qualityMetrics": {"confidence": 88},
        "status": "pending",
    }
    attestation_id = db.curatedzones.insert_one(attestation).inserted_id
    print(f"Attestation inseree : {attestation_id}")

    # Afficher le curl a utiliser
    company_id_str = str(company_id)
    invoice_id_str = str(invoice_id)

    curl = f"""
-- Test cross-document (SIRET_MISMATCH + DATE_EXPIRATION attendus) --

curl -X POST http://localhost:8001/fraud/evaluate \\
  -H "Content-Type: application/json" \\
  -d '{{
    "extraction": {{
      "_id": "{invoice_id_str}",
      "company": "{company_id_str}",
      "documentType": "invoice",
      "invoiceData": {{
        "invoiceNumber": "F-TEST-001",
        "issuerSiret": "11111111100001",
        "issuerTva": "FR11111111100",
        "amount": {{"ht": 2000, "tva": 400, "ttc": 2400}},
        "issueDate": "2026-02-01"
      }},
      "qualityMetrics": {{"confidence": 92}}
    }},
    "include_cross_document": true
  }}'
"""
    print(curl)
    print(f"company_id pour tests manuels : {company_id_str}")


if __name__ == "__main__":
    seed()
