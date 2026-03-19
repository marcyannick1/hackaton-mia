# 📋 Backend - Platform de Traitement de Documents Administratifs

## 🚀 Architecture

### Stack Technologique

- **Node.js + Express** - API REST
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM (Object Document Mapper)
- **Docker** - Conteneurisation

### Collections MongoDB

La plateforme utilise 4 collections principales:

| Collection      | Rôle               | Fields Clés                                   |
| --------------- | ------------------ | --------------------------------------------- |
| **users**       | Opérateurs, admins | username, email, role, department             |
| **companies**   | Fournisseurs       | siret, siren, tva, complianceStatus           |
| **documents**   | Pièces comptables  | filename, documentType, status, storageZone   |
| **extractions** | Données OCR        | invoiceData, attestationData, inconsistencies |

📖 **Documentation détaillée**: Voir [COLLECTIONS.md](./COLLECTIONS.md)

---

## 📦 Installation

### Prérequis

- Node.js (v16+)
- Docker & Docker Compose
- Git

### 1️⃣ Installer les dépendances

```bash
cd backend
npm install
```

### 2️⃣ Configuration d'environnement

```bash
cp .env.example .env
```

Fichier `.env`:

```env
MONGO_URI=mongodb://mongo:27017/hackathon
PORT=3000
NODE_ENV=development
```

### 3️⃣ Lancer l'application

#### En local (développement)

```bash
npm run dev
```

L'API sera disponible à: **http://localhost:3000**

#### Avec Docker Compose (du répertoire racine)

```bash
docker-compose up --build
```

---

## 🗂️ Structure du Projet

```
backend/
├── config/
│   └── database.js           # Connexion MongoDB
├── models/
│   ├── User.js               # Schéma utilisateurs
│   ├── Company.js            # Schéma entreprises
│   ├── Document.js           # Schéma documents
│   └── Extraction.js         # Schéma extractions OCR
├── index.js                  # Serveur Express + routes
├── package.json              # Dépendances
├── .env.example              # Template configuration
├── .gitignore                # Fichiers à ignorer
├── COLLECTIONS.md            # Doc détaillée des collections
└── README.md                 # Ce fichier
```

---

## 📊 Flux de Traitement

```
1. Upload Document
   └→ Document créé (status: 'uploaded', zone: 'raw')

2. OCR Processing (Tesseract)
   └→ Document zone: 'clean' + ocrText rempli

3. Data Extraction
   └→ Extraction créée avec invoiceData/attestationData

4. Validation
   └→ Détection d'incohérences
   └→ status: 'approved' ou 'rejected'

5. Final Storage
   └→ Document zone: 'curated'
   └→ Prêt pour systèmes internes (CRM, Backend Fournisseur)
```

---

## 🔍 Détection d'Incohérences

L'extraction détecte automatiquement:

| Erreur                 | Exemple                           | Exemple Récup |
| ---------------------- | --------------------------------- | ------------- |
| **SIRET Mismatch**     | SIRET facture ≠ SIRET attestation | ❌ Blocker    |
| **TVA Invalid**        | TVA ne correspond pas au SIRET    | ❌ Blocker    |
| **Date Expiration**    | Attestation URSSAF expirée        | ⚠️ Warning    |
| **Montant Incohérent** | HT + TVA ≠ TTC                    | ❌ Blocker    |
| **Doublon Document**   | Facture déjà importée             | ⚠️ Warning    |

---

## 🛠️ Développement

### Mode Watch (nodemon)

```bash
npm run dev
```

### Logs MongoDB

Le serveur affiche la connexion MongoDB:

```
✓ MongoDB connected successfully
✓ Server running at http://localhost:3000/
```

### Tests API

Utiliser Postman, Insomnia ou curl:

```bash
curl http://localhost:3000/health
```

---

## 📝 Notes d'Intégration Airflow

Ces collections seront exploitées par les DAGs Airflow:

1. **DAG: ocr_processing**
   - Lit documents raw_zone
   - Lance Tesseract
   - Crée Extraction

2. **DAG: data_extraction**
   - Parse texte OCR
   - Extrait invoiceData, attestationData
   - Détecte incohérences

3. **DAG: validation_and_conformity**
   - Valide données vs schéma
   - Vérifie conformité URSSAF/SIRET
   - Alerte si non-compliant

4. **DAG: export_crm_backend**
   - Exporte données curated_zone
   - Push vers CRM et Backend Fournisseur

---

## 🤝 Intégration Frontend

Le Frontend React peut:

1. **Upload Documents** → POST /api/documents
2. **Lister Entreprises** → GET /api/companies
3. **Voir Extractions** → GET /api/extractions
4. **Vérifier Statut** → GET /api/documents?status=processing

---

## 🆘 Troubleshooting

### Erreur: "MongoDB connection error"

```
✗ Vérifier que MongoDB est lancé
✗ Vérifier MONGO_URI dans .env
```

### Erreur: "Port 3000 already in use"

```
# Changer PORT en .env
PORT=3001
```

### Reset complet

```bash
docker-compose down -v  # Supprime volumes
docker-compose up --build
```

---

## 📚 Références

- [Mongoose Documentation](https://mongoosejs.com/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Schema Design](https://docs.mongodb.com/manual/)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Status**: ✅ Collections créées | 🔄 Routes CRUD basiques | ⏳ Intégration OCR
