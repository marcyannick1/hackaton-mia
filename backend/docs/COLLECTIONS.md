# MongoDB Collections - Structure Documentation

## Collections Overview

Ce document décrit la structure des 4 collections MongoDB créées pour la plateforme de traitement de documents administratifs.

---

## 1. Collection: `users`

**Description**: Stocke les informations des opérateurs et administrateurs du système.

### Schema:
```json
{
  "username": "string (unique, required)",
  "email": "string (unique, required, validated)",
  "password": "string (6+ chars, not returned by default)",
  "role": "enum: ['admin', 'operator', 'viewer']",
  "department": "string",
  "isActive": "boolean",
  "lastLogin": "date",
  "createdAt": "date (auto)",
  "updatedAt": "date (auto)"
}
```

### Exemple:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "username": "ahmed_op",
  "email": "ahmed@company.com",
  "role": "operator",
  "department": "Accounting",
  "isActive": true,
  "lastLogin": "2026-03-16T10:30:00Z"
}
```

---

## 2. Collection: `companies`

**Description**: Stocke les informations des fournisseurs et clients.

### Schema:
```json
{
  "name": "string (required)",
  "siret": "string (14 digits, unique, required)",
  "siren": "string (9 digits)",
  "tva": "string (format: FR + 11 digits)",
  "address": {
    "street": "string",
    "postalCode": "string",
    "city": "string",
    "country": "string"
  },
  "email": "string (validated)",
  "phone": "string",
  "website": "string",
  "iban": "string",
  "bic": "string",
  "complianceStatus": "enum: ['compliant', 'non-compliant', 'pending', 'unknown']",
  "attestationExpiry": {
    "urssaf": "date",
    "kbis": "date"
  },
  "documents": ["ObjectId (refs to Document collection)"],
  "notes": "string",
  "createdAt": "date (auto)",
  "updatedAt": "date (auto)"
}
```

### Exemple:
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Acme Corporation France",
  "siret": "12345678901234",
  "siren": "123456789",
  "tva": "FR12345678901",
  "complianceStatus": "compliant",
  "attestationExpiry": {
    "urssaf": "2026-12-31T23:59:59Z",
    "kbis": "2027-06-30T23:59:59Z"
  }
}
```

---

## 3. Collection: `documents`

**Description**: Stocke les métadonnées des documents uploadés (factures, devis, attestations, etc.).

### Schema:
```json
{
  "filename": "string (required)",
  "originalName": "string",
  "fileSize": "number",
  "filePath": "string",
  "fileType": "enum: ['pdf', 'image', 'other']",
  "mimeType": "string",
  "documentType": "enum: ['invoice', 'quote', 'attestation_siret', 'attestation_urssaf', 'kbis', 'rib', 'other']",
  "company": "ObjectId (ref to Company)",
  "uploadedBy": "ObjectId (ref to User, required)",
  "status": "enum: ['uploaded', 'processing', 'completed', 'failed']",
  "extractedData": "ObjectId (ref to Extraction)",
  "ocrText": "string",
  "confidence": "number (0-100)",
  "isValidated": "boolean",
  "validatedBy": "ObjectId (ref to User)",
  "validationDate": "date",
  "storageZone": "enum: ['raw', 'clean', 'curated']",
  "errors": ["string"],
  "notes": "string",
  "createdAt": "date (auto)",
  "updatedAt": "date (auto)"
}
```

### Exemple:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "filename": "invoice_20260315_001.pdf",
  "originalName": "facture_Mars_2026.pdf",
  "fileSize": 245000,
  "documentType": "invoice",
  "company": "507f1f77bcf86cd799439012",
  "uploadedBy": "507f1f77bcf86cd799439011",
  "status": "completed",
  "confidence": 92,
  "storageZone": "clean",
  "isValidated": true
}
```

---

## 4. Collection: `extractions`

**Description**: Stocke les données extraites des documents via OCR et la détection d'incohérences.

### Schema:
```json
{
  "document": "ObjectId (ref to Document, required)",
  "documentType": "string",
  "extractionMethod": "enum: ['ocr', 'manual', 'api']",
  "extractedData": {
    "siret": "string",
    "siren": "string",
    "tva": "string",
    "companyName": "string",
    "issueDate": "date",
    "expiryDate": "date"
  },
  "invoiceData": {
    "invoiceNumber": "string",
    "issuer": "string",
    "issuerSiret": "string",
    "amount": {
      "ht": "number (Hors Taxe)",
      "ttc": "number (Toutes Taxes Comprises)",
      "tva": "number"
    },
    "issueDate": "date",
    "dueDate": "date",
    "lines": [
      {
        "description": "string",
        "quantity": "number",
        "unitPrice": "number",
        "amount": "number"
      }
    ]
  },
  "attestationData": {
    "attestationType": "enum: ['siret', 'urssaf', 'kbis']",
    "issuer": "string",
    "issueDate": "date",
    "expiryDate": "date",
    "status": "enum: ['valid', 'expired', 'unknown']"
  },
  "ribData": {
    "iban": "string",
    "bic": "string",
    "accountHolder": "string",
    "bankName": "string"
  },
  "qualityMetrics": {
    "confidence": "number (0-100)",
    "pageCount": "number",
    "qualityNotes": "string"
  },
  "inconsistencies": [
    {
      "type": "string",
      "description": "string",
      "severity": "enum: ['info', 'warning', 'error']"
    }
  ],
  "status": "enum: ['pending', 'in_review', 'approved', 'rejected']",
  "reviewedBy": "ObjectId (ref to User)",
  "reviewDate": "date",
  "reviewNotes": "string",
  "createdAt": "date (auto)",
  "updatedAt": "date (auto)"
}
```

### Exemple:
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "document": "507f1f77bcf86cd799439013",
  "documentType": "invoice",
  "extractionMethod": "ocr",
  "extractedData": {
    "siret": "12345678901234",
    "companyName": "Acme Corporation France",
    "issueDate": "2026-03-10T00:00:00Z"
  },
  "invoiceData": {
    "invoiceNumber": "2026-001",
    "amount": {
      "ht": 1000,
      "tva": 200,
      "ttc": 1200
    },
    "dueDate": "2026-04-10T00:00:00Z"
  },
  "qualityMetrics": {
    "confidence": 92,
    "pageCount": 1
  },
  "inconsistencies": [],
  "status": "approved"
}
```

---

## Relationships & Flow

```
User
  ├── uploads → Document
  ├── validates → Document
  └── reviews → Extraction

Company
  ├── has multiple → Document
  └── has multiple → Extraction (via Document)

Document
  ├── belongs to → Company
  ├── uploaded by → User
  ├── validated by → User
  └── generates → Extraction

Extraction
  ├── belongs to → Document
  ├── reviewed by → User
  ├── references → Company (via extractedData.companyName)
  └── detects inconsistencies (SIRET, dates, etc.)
```

---

## Détection d'Incohérences (Intelligences)

L'application peut détecter automatiquement:

| Type | Exemple | Severité |
|------|---------|----------|
| SIRET Mismatch | SIRET facture ≠ SIRET attestation | Error |
| Date Expiration | Attestation URSSAF expirée | Warning |
| TVA Invalid | TVA ne correspond pas au SIRET | Error |
| Montant | Montant HT + TVA ≠ TTC | Error |
| Doublon | Facture déjà importée | Warning |

---

## Zones de Stockage (Data Lake)

```
Raw Zone     → Documents bruts uploadés
    ↓
Clean Zone   → Texte OCR + métadonnées
    ↓
Curated Zone → Données structurées ✓ validées
```

---

## API Endpoints

### Users
- `POST /api/users` - Créer un utilisateur
- `GET /api/users` - Lister les utilisateurs

### Companies
- `POST /api/companies` - Créer une entreprise
- `GET /api/companies` - Lister les entreprises

### Documents
- `POST /api/documents` - Upload de document
- `GET /api/documents` - Lister les documents

### Extractions
- `POST /api/extractions` - Créer extraction (après OCR)
- `GET /api/extractions` - Lister les extractions

---

## Prochaines étapes

1. ✅ Créer les collections MongoDB
2. 🔄 Implémenter les routes CRUD complètes
3. 🔄 Créer les services OCR (Tesseract/AWS Textract)
4. 🔄 Intégrer Airflow pour orchestration
5. 🔄 Implémenter la détection d'incohérences
6. 🔄 Développer le frontend de visualization
