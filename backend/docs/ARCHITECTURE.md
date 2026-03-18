# MongoDB Collections - Data Model Diagram

## 📊 ER Diagram (Relationships)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────┐         ┌─────────────────┐                │
│  │     USERS       │         │    COMPANIES    │                │
│  ├─────────────────┤         ├─────────────────┤                │
│  │ _id (PK)        │         │ _id (PK)        │                │
│  │ username        │         │ name            │                │
│  │ email (unique)  │         │ siret (unique)  │                │
│  │ password        │         │ siren           │                │
│  │ role            │         │ tva             │                │
│  │ department      │         │ address         │                │
│  │ isActive        │         │ email           │                │
│  │ lastLogin       │         │ phone           │                │
│  │ timestamps      │         │ iban            │                │
│  └─────────────────┘         │ bic             │                │
│         │                    │ complianceStatus│                │
│         │                    │ attestationExiry│                │
│         │                    │ documents []    │                │
│         │                    │ timestamps      │                │
│         │                    └─────────────────┘                │
│         │                            │                          │
│         │                            │ 1───N                    │
│         │                            │                          │
│         │        ┌─────────────────┐ │                          │
│         │        │   DOCUMENTS     │◄┘                          │
│         └───────►├─────────────────┤                            │
│       validates  │ _id (PK)        │                            │
│       uploads    │ filename        │                            │
│       validates  │ documentType    │                            │
│                  │ company (FK)    │                            │
│                  │ uploadedBy (FK) │                            │
│                  │ status          │                            │
│                  │ storageZone     │ raw→clean→curated          │
│                  │ extractedData   │                            │
│                  │ ocrText         │                            │
│                  │ isValidated     │                            │
│                  │ validatedBy (FK)│                            │
│                  │ confidence      │                            │
│                  │ timestamps      │                            │
│                  └─────────────────┘                            │
│                          │                                       │
│                          │ 1───1                               │
│                          │                                       │
│                  ┌──────────────────┐                           │
│                  │  EXTRACTIONS     │                           │
│  ┌──────────────►├──────────────────┤                           │
│  │ reviews       │ _id (PK)         │                           │
│  │               │ document (FK)    │                           │
│  │               │ documentType     │                           │
│  │               │ extractionMethod │ ocr|manual|api            │
│  │               │                  │                           │
│  │  ┌────────────┤ extractedData    │ (common fields)           │
│  │  │            │ invoiceData      │ (optional)                │
│  │  │            │ attestationData  │ (optional)                │
│  │  │            │ ribData          │ (optional)                │
│  │  │            │                  │                           │
│  │  │            │ inconsistencies[]│ Detect errors             │
│  │  │            │ qualityMetrics   │                           │
│  │  │            │                  │                           │
│  │  │            │ status           │ pending|in_review|approved│
│  │  │            │ reviewedBy (FK)  │                           │
│  │  │            │ reviewDate       │                           │
│  │  │            │ reviewNotes      │                           │
│  │  │            │ timestamps       │                           │
│  │  │            └──────────────────┘                           │
│  │  │                    A                                       │
│  └──┼────────────────────┘                                       │
│     └─ User role: admin
│        can review
│
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow - Processing Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│  INPUT: Physical Document (Invoice, Attestation, RIB, etc)      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │  UPLOAD PHASE │
         └───────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌──────────────────┐   ┌─────────────────────┐
│ Create DOCUMENT  │   │ Find/Create COMPANY │
├──────────────────┤   ├─────────────────────┤
│ status: uploaded │   │ Validate SIRET      │
│ zone: RAW        │   │ Validate TVA        │
│ file → storage   │   └─────────────────────┘
└──────────────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  OCR PROCESSING (Airflow)
    └────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌──────────────────┐   ┌────────────────┐
│ Run Tesseract    │   │ Extract Text   │
├──────────────────┤   ├────────────────┤
│ PDF/Image → Text │   │ Parse fields   │
└──────────────────┘   └────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌──────────────────┐   ┌────────────────────┐
│ Update DOCUMENT  │   │ Create EXTRACTION  │
├──────────────────┤   ├────────────────────┤
│ status: completed│   │ Fill invoiceData   │
│ zone: CLEAN      │   │ OR attestationData │
│ ocrText: [...]   │   │ OR ribData         │
│ confidence: 92   │   └────────────────────┘
└──────────────────┘
                 │
                 ▼
    ┌────────────────────────┐
    │  VALIDATION PHASE      │
    └────────────────────────┘
                 │
    ┌────────────┴───────────────────────┐
    ▼                                    ▼
┌────────────────────┐      ┌───────────────────────┐
│ Check Consistency  │      │ Update COMPANY Status │
├────────────────────┤      ├───────────────────────┤
│ ✓ SIRET mismatch   │      │ complianceStatus      │
│ ✓ TVA match SIRET  │      │ attestationExpiry     │
│ ✓ Montant math     │      └───────────────────────┘
│ ✓ Date expiry      │
│ ✓ Doublon?         │
└────────────────────┘
         │
    IF OK │  IF ERROR
    ┌────┴─────┐
    ▼          ▼
┌─────────┐  ┌──────────────────┐
│APPROVED │  │Alert: Rejected   │
└────┬────┘  ├──────────────────┤
     │       │ Severity: ERROR  │
     ▼       │ Action: Manual   │
    status:  │ review required  │
    approved└──────────────────┘
     │
     ▼
┌──────────────────────┐
│ Update DOCUMENT      │
├──────────────────────┤
│ zone: CURATED        │
│ status: validated    │
└──────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│ EXPORT TO EXTERNAL SYSTEMS       │
├──────────────────────────────────┤
│ • CRM System (invoice data)      │
│ • Supplier DB (company data)     │
│ • Conformity Tool (compliance)   │
│ • Archive (audit trail)          │
└──────────────────────────────────┘
```

---

## 📦 Storage Zones Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB COLLECTIONS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │             RAW ZONE (Original Files)                  │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ • Uploaded PDFs, Images                                │    │
│  │ • No processing                                        │    │
│  │ • Compliance: Legal safeguard                          │    │
│  │ • Time: Document upload                               │    │
│  │ • Status: uploaded, processing, failed                │    │
│  │                                                        │    │
│  │  Documents ___→  {storageZone: "raw"}                 │    │
│  └────────────────────────────────────────────────────────┘    │
│                         ↓ OCR                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │             CLEAN ZONE (OCR Text)                      │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ • Raw OCR output from Tesseract                        │    │
│  │ • ocrText field populated                              │    │
│  │ • confidence score (0-100)                             │    │
│  │ • Time: After OCR processing                           │    │
│  │ • Inconsistencies detected                             │    │
│  │                                                        │    │
│  │  Documents ___→  {storageZone: "clean",               │    │
│  │                   ocrText: "...",                      │    │
│  │                   confidence: 92}                      │    │
│  └────────────────────────────────────────────────────────┘    │
│                         ↓ Validation                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │          CURATED ZONE (Structured Data)                │    │
│  ├────────────────────────────────────────────────────────┤    │
│  │ • Extracted structured fields                          │    │
│  │ • invoiceData, attestationData, ribData                │    │
│  │ • Validated & approved                                 │    │
│  │ • Ready for external systems                           │    │
│  │ • Time: After manual review & approval                 │    │
│  │                                                        │    │
│  │  Extractions ___→  {status: "approved",               │    │
│  │                     invoiceData: {...},                │    │
│  │                     inconsistencies: []}               │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Inconsistency Detection Matrix

```
┌────────────────────────────────────────────────────────────────┐
│                  INCONSISTENCY TYPES                            │
├───────────────────────┬──────────────────┬─────────────────────┤
│ Type                  │ Check            │ Severity            │
├───────────────────────┼──────────────────┼─────────────────────┤
│ SIRET_MISMATCH        │ Invoice vs       │ ERROR (Blocker)     │
│                       │ Company SIRET    │                     │
├───────────────────────┼──────────────────┼─────────────────────┤
│ TVA_INVALID           │ TVA matches      │ ERROR (Blocker)     │
│                       │ SIRET database   │                     │
├───────────────────────┼──────────────────┼─────────────────────┤
│ AMOUNT_MISMATCH       │ HT + TVA = TTC   │ ERROR (Blocker)     │
│                       │ Math check       │                     │
├───────────────────────┼──────────────────┼─────────────────────┤
│ DATE_EXPIRATION       │ Attestation      │ WARNING (Review)    │
│                       │ Date < Today     │                     │
├───────────────────────┼──────────────────┼─────────────────────┤
│ DUPLICATE_DOCUMENT    │ Invoice number   │ WARNING (Review)    │
│                       │ Already exists   │                     │
├───────────────────────┼──────────────────┼─────────────────────┤
│ OCR_QUALITY_LOW       │ Confidence < 70% │ INFO (Reprocess)    │
│                       │ Suggest manual   │                     │
├───────────────────────┼──────────────────┼─────────────────────┤
│ MISSING_FIELD         │ Required field   │ ERROR (Blocker)     │
│                       │ Not extracted    │                     │
└───────────────────────┴──────────────────┴─────────────────────┘

Action per Severity:
  ERROR     → Manual review required, cannot export
  WARNING   → Flag to operator, can still export with notes
  INFO      → Log only, auto-proceed
```

---

## 🔗 API Data Flow Examples

### Example 1: Invoice Processing

```json
// Step 1: Upload document
POST /api/documents
{
  "filename": "inv_001.pdf",
  "documentType": "invoice",
  "company": "COMPANY_ID",
  "uploadedBy": "USER_ID",
  "storageZone": "raw"
}
→ Document created with status: "uploaded"

// Step 2: OCR processing (Airflow)
PATCH /api/documents/{doc_id}
{
  "status": "completed",
  "storageZone": "clean",
  "ocrText": "Acme Corp...",
  "confidence": 92
}

// Step 3: Create extraction
POST /api/extractions
{
  "document": "DOC_ID",
  "invoiceData": {
    "invoiceNumber": "2026-001",
    "amount": {"ht": 1000, "tva": 200, "ttc": 1200}
  }
}
→ Extraction created with status: "pending"

// Step 4: Validation
PATCH /api/extractions/EXTR_ID
{
  "inconsistencies": [],
  "status": "approved"
}

// Step 5: Final storage
PATCH /api/documents/{doc_id}
{
  "storageZone": "curated",
  "status": "validated"
}
```

---

**Diagram Status**: Last Updated 2026-03-16
