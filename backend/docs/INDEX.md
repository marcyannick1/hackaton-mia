# 📚 Backend Documentation Index

## 🚀 Getting Started

### For Quick Setup (< 5 min)
👉 Start here: [QUICK_START.md](./QUICK_START.md)
- Install dependencies
- Run server
- Test endpoints

### For Detailed Setup (Installation & Architecture)
👉 Read: [SETUP.md](./SETUP.md)
- Complete installation guide
- Environment configuration
- API endpoints overview
- Docker integration
- Troubleshooting

---

## 📊 Understanding the Data Model

### Collections Overview
👉 Read: [COLLECTIONS.md](./COLLECTIONS.md)
- Detailed schema documentation
- 4 main collections: Users, Companies, Documents, Extractions
- Field definitions and examples
- Data relationships
- Inconsistency detection rules

### Architecture & Data Flow
👉 Read: [ARCHITECTURE.md](./ARCHITECTURE.md)
- ER Diagram (Entity Relationships)
- Data processing pipeline
- Storage zones (Raw → Clean → Curated)
- Inconsistency detection matrix
- API data flow examples

---

## 🔌 API Reference

### Live Examples
👉 See: [API_EXAMPLES.md](./API_EXAMPLES.md)
- Complete cURL examples for all endpoints
- Sample request/response pairs
- Real-world use cases
- Integration patterns

---

## 📁 File Structure

```
backend/
├── 📄 package.json           ← Dependencies (mongoose, dotenv)
├── 📄 index.js               ← Express server + CRUD routes
├── 📁 config/
│   └── database.js           ← MongoDB connection
├── 📁 models/
│   ├── User.js               ← User schema
│   ├── Company.js            ← Company schema (SIRET/TVA validation)
│   ├── Document.js           ← Document schema (invoice, attestation, etc)
│   └── Extraction.js         ← Extraction schema (OCR data + validation)
│
├── 📄 QUICK_START.md         ← ⭐ START HERE
├── 📄 SETUP.md               ← Installation & configuration
├── 📄 COLLECTIONS.md         ← Detailed schema docs
├── 📄 ARCHITECTURE.md        ← Diagrams & data flow
├── 📄 API_EXAMPLES.md        ← cURL examples
├── 📄 INDEX.md               ← This file
├── 📄 .env.example           ← Environment template
└── 📄 .gitignore
```

---

## 🎯 Collections at a Glance

### 1️⃣ Users
```json
{
  "username": "ahmed_op",
  "email": "ahmed@company.com",
  "role": "fournisseur",      // admin | fournisseur
  "department": "Accounting"
}
```
📍 Endpoint: `/api/users`

### 2️⃣ Companies
```json
{
  "name": "Acme Corp",
  "siret": "12345678901234",  // Unique ID
  "tva": "FR12345678901",
  "complianceStatus": "compliant"  // compliant | non-compliant | pending
}
```
📍 Endpoint: `/api/companies`

### 3️⃣ Documents
```json
{
  "filename": "invoice_001.pdf",
  "documentType": "invoice",  // invoice | quote | attestation_urssaf | kbis | rib
  "status": "completed",      // uploaded | processing | completed | failed
  "storageZone": "clean",     // raw | clean | curated
  "confidence": 92
}
```
📍 Endpoint: `/api/documents`

### 4️⃣ Extractions
```json
{
  "document": "DOC_ID",
  "invoiceData": {
    "invoiceNumber": "2026-001",
    "amount": {"ht": 1000, "tva": 200, "ttc": 1200}
  },
  "inconsistencies": [],
  "status": "approved"  // pending | in_review | approved | rejected
}
```
📍 Endpoint: `/api/extractions`

---

## 🔄 Processing Pipeline

```
Physical Document
    ↓
Upload → Document (raw zone)
    ↓
OCR (Tesseract) → Extraction created (clean zone)
    ↓
Validation → Check inconsistencies
    ↓
Approved → Document (curated zone)
    ↓
Export to CRM, Backend Fournisseur, Conformity Tool
```

---

## 🧪 Quick Test

```bash
# Start server
npm run dev

# Health check
curl http://localhost:3000/health

# Create user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","role":"operator"}'

# List users
curl http://localhost:3000/api/users
```

---

## 🔗 Integration Points

| System | Data | From | To |
|--------|------|------|-----|
| **CRM** | Invoice data, Customer info | Extraction (curated) | External ERP |
| **Backend Fournisseur** | Company profile, Compliance | Company, Attestation | Supplier DB |
| **Conformity Tool** | Compliance status, Expiry alerts | Extraction, Company | Alerts/Dashboard |
| **Archive/Audit** | Full document trail | All collections | Audit system |

---

## 🛠️ Technologies

- **Runtime**: Node.js
- **Framework**: Express.js (REST API)
- **Database**: MongoDB (NoSQL)
- **ODM**: Mongoose (Schema + Validation)
- **Environment**: Dotenv
- **Container**: Docker
- **Orchestration**: Airflow

---

## 🔐 Security Features

✓ Password hashing (via mongoose)
✓ Role-based access control (admin, operator, viewer)
✓ Password fields hidden in API responses (select: false)
✓ SIRET uniqueness validation (official ID)
✓ Email format validation
✓ IBAN/BIC format validation

---

## 📞 Support & Troubleshooting

### MongoDB won't connect
→ Check MONGO_URI in .env
→ Ensure MongoDB is running: `docker-compose logs mongo`

### Port 3000 already in use
→ Change PORT in .env

### Reset everything
```bash
docker-compose down -v
docker-compose up --build
```

---

## 🚀 Next Steps

After setup:

1. ✅ **Collections Created & Tested**
2. 🔄 **Integrate OCR** (Tesseract/AWS)
3. 🔄 **Create Airflow DAGs**
   - ocr_processing
   - data_extraction
   - validation_conformity
   - export_crm_backend
4. 🔄 **Connect Frontend** (React → /api/*)
5. 🔄 **Deploy** (Docker → Production)

---

## 📖 External References

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/)
- [Docker Docs](https://docs.docker.com/)

---

**Last Updated**: 2026-03-16  
**Status**: ✅ Collections Ready | 🔄 Testing | ⏳ OCR Integration
