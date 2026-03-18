// ===================================
// MongoDB Collections - Usage Examples
// ===================================

// 1. CREATE USER (Operator)
// ===================================
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "username": "ahmed_operator",
  "email": "ahmed@company.com",
  "password": "SecurePass123!",
  "role": "operator",
  "department": "Accounting"
}

// Response:
// {
//   "_id": "507f1f77bcf86cd799439011",
//   "username": "ahmed_operator",
//   "email": "ahmed@company.com",
//   "role": "operator",
//   "department": "Accounting",
//   "isActive": true,
//   "createdAt": "2026-03-16T10:30:00Z"
// }


// 2. CREATE COMPANY (Supplier)
// ===================================
POST http://localhost:3000/api/companies
Content-Type: application/json

{
  "name": "Acme Corporation France",
  "siret": "12345678901234",
  "siren": "123456789",
  "tva": "FR12345678901",
  "address": {
    "street": "123 Rue de Paris",
    "postalCode": "75001",
    "city": "Paris",
    "country": "FR"
  },
  "email": "contact@acme.fr",
  "phone": "+33 1 23 45 67 89",
  "website": "www.acme.fr",
  "iban": "FR1420041010050500013M02606",
  "bic": "BNAGFRPPXXX",
  "complianceStatus": "unknown"
}

// Response:
// {
//   "_id": "507f1f77bcf86cd799439012",
//   "name": "Acme Corporation France",
//   "siret": "12345678901234",
//   "complianceStatus": "unknown",
//   "documents": [],
//   "createdAt": "2026-03-16T10:35:00Z"
// }


// 3. UPLOAD DOCUMENT (Invoice)
// ===================================
POST http://localhost:3000/api/documents
Content-Type: application/json

{
  "filename": "67890_invoice_20260315.pdf",
  "originalName": "facture_acme_mars_2026.pdf",
  "fileSize": 245000,
  "filePath": "/uploads/raw/67890_invoice_20260315.pdf",
  "fileType": "pdf",
  "mimeType": "application/pdf",
  "documentType": "invoice",
  "company": "507f1f77bcf86cd799439012",
  "uploadedBy": "507f1f77bcf86cd799439011",
  "storageZone": "raw"
}

// Response:
// {
//   "_id": "507f1f77bcf86cd799439013",
//   "filename": "67890_invoice_20260315.pdf",
//   "documentType": "invoice",
//   "company": "507f1f77bcf86cd799439012",
//   "uploadedBy": "507f1f77bcf86cd799439011",
//   "status": "uploaded",
//   "confidence": 0,
//   "storageZone": "raw",
//   "isValidated": false,
//   "createdAt": "2026-03-16T10:40:00Z"
// }


// 4. OCR PROCESSING (via Airflow)
// ===================================
// Status should be updated after OCR:

PATCH http://localhost:3000/api/documents/507f1f77bcf86cd799439013
Content-Type: application/json

{
  "status": "completed",
  "storageZone": "clean",
  "ocrText": "ACME CORPORATION\nSIRET: 12345678901234\nFacture N°: 2026-001\ndate: 15/03/2026\nMontant HT: 1000.00 EUR\nTVA 20%: 200.00 EUR\nMontant TTC: 1200.00 EUR\nChèque destinataire: ACME...",
  "confidence": 92
}


// 5. CREATE EXTRACTION (After OCR)
// ===================================
POST http://localhost:3000/api/extractions
Content-Type: application/json

{
  "document": "507f1f77bcf86cd799439013",
  "documentType": "invoice",
  "extractionMethod": "ocr",
  "extractedData": {
    "siret": "12345678901234",
    "siren": "123456789",
    "tva": "FR12345678901",
    "companyName": "Acme Corporation",
    "issueDate": "2026-03-15T00:00:00Z"
  },
  "invoiceData": {
    "invoiceNumber": "2026-001",
    "issuer": "Acme Corporation",
    "issuerSiret": "12345678901234",
    "issuerTva": "FR12345678901",
    "issuerAddress": "123 Rue de Paris, 75001 Paris",
    "amount": {
      "ht": 1000,
      "ttc": 1200,
      "tva": 200
    },
    "issueDate": "2026-03-15T00:00:00Z",
    "dueDate": "2026-04-14T00:00:00Z",
    "currency": "EUR",
    "lines": [
      {
        "description": "Consulting Services",
        "quantity": 10,
        "unitPrice": 100,
        "amount": 1000
      }
    ]
  },
  "qualityMetrics": {
    "confidence": 92,
    "pageCount": 1,
    "qualityNotes": "Good quality scan"
  },
  "inconsistencies": [],
  "status": "pending"
}

// Response:
// {
//   "_id": "507f1f77bcf86cd799439014",
//   "document": "507f1f77bcf86cd799439013",
//   "documentType": "invoice",
//   "extractedData": { ... },
//   "invoiceData": { ... },
//   "inconsistencies": [],
//   "status": "pending",
//   "createdAt": "2026-03-16T10:45:00Z"
// }


// 6. VALIDATION & INCONSISTENCY DETECTION
// ===================================
// Update extraction with validation results:

PATCH http://localhost:3000/api/extractions/507f1f77bcf86cd799439014
Content-Type: application/json

{
  "inconsistencies": [
    {
      "type": "SIRET_MISMATCH",
      "description": "SIRET on invoice matches company SIRET ✓",
      "severity": "info"
    },
    {
      "type": "AMOUNT_CHECK",
      "description": "Amount calculation verified: 1000 + 200 = 1200 ✓",
      "severity": "info"
    }
  ],
  "status": "approved",
  "reviewedBy": "507f1f77bcf86cd799439011",
  "reviewDate": "2026-03-16T11:00:00Z",
  "reviewNotes": "All data validated successfully. Ready for CRM import."
}


// 7. UPLOAD ATTESTATION (URSSAF)
// ===================================
POST http://localhost:3000/api/documents
Content-Type: application/json

{
  "filename": "67890_attestation_urssaf_20260315.pdf",
  "originalName": "attestation_vigilance_urssaf.pdf",
  "fileSize": 120000,
  "filePath": "/uploads/raw/67890_attestation_urssaf.pdf",
  "fileType": "pdf",
  "documentType": "attestation_urssaf",
  "company": "507f1f77bcf86cd799439012",
  "uploadedBy": "507f1f77bcf86cd799439011",
  "storageZone": "raw"
}


// 8. EXTRACT ATTESTATION DATA
// ===================================
POST http://localhost:3000/api/extractions
Content-Type: application/json

{
  "document": "507f1f77bcf86cd799439015",
  "documentType": "attestation_urssaf",
  "extractionMethod": "ocr",
  "extractedData": {
    "siret": "12345678901234",
    "companyName": "Acme Corporation"
  },
  "attestationData": {
    "attestationType": "urssaf",
    "issuer": "URSSAF",
    "issuerSiret": "12345678901234",
    "issueDate": "2025-06-01T00:00:00Z",
    "expiryDate": "2026-12-31T23:59:59Z",
    "status": "valid"
  },
  "qualityMetrics": {
    "confidence": 98,
    "pageCount": 1
  },
  "status": "pending"
}


// 9. DETECT EXPIRATION ERROR
// ===================================
// Example: If attestation is expired

PATCH http://localhost:3000/api/extractions/507f1f77bcf86cd799439016
Content-Type: application/json

{
  "attestationData": {
    "attestationType": "urssaf",
    "issuer": "URSSAF",
    "issuerSiret": "12345678901234",
    "issueDate": "2024-06-01T00:00:00Z",
    "expiryDate": "2025-12-31T23:59:59Z",
    "status": "expired"
  },
  "inconsistencies": [
    {
      "type": "DATE_EXPIRATION",
      "description": "URSSAF attestation expired on 2025-12-31",
      "severity": "error"
    }
  ],
  "status": "rejected",
  "reviewedBy": "507f1f77bcf86cd799439011",
  "reviewNotes": "Attestation expired. Company is non-compliant."
}

// Update company compliance status:
PATCH http://localhost:3000/api/companies/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "complianceStatus": "non-compliant",
  "attestationExpiry": {
    "urssaf": "2025-12-31T23:59:59Z"
  }
}


// 10. GET ALL DATA (Query Examples)
// ===================================

// Get all users
GET http://localhost:3000/api/users

// Get all companies
GET http://localhost:3000/api/companies

// Get all documents (with relationships)
GET http://localhost:3000/api/documents

// Get all extractions (with validation info)
GET http://localhost:3000/api/extractions


// ===================================
// INTEGRATION WITH MIA SYSTEMS
// ===================================

// Once extraction is APPROVED (status: 'approved'):
// The document moves to 'curated' zone and can be:
//
// 1. Pushed to CRM System
//    - Invoice data directly to ERP
//    - Company data to supplier database
//
// 2. Pushed to Conformity Tool
//    - Compliance status alerts
//    - Expiration date warnings
//
// 3. Archived for audit
//    - Full extraction + document trail
