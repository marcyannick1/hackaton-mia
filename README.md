# 🏥 Hackaton MIA

Plateforme intelligente de traitement et validation des documents administratifs et comptables avec détection de fraude par IA.

React · Node.js · Python · MongoDB · Docker · PyTorch

---

## 📋 Table des Matières

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#️-architecture)
- [Technologies](#-technologies)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Démarrage](#-démarrage)
- [Pipeline de Traitement](#-pipeline-de-traitement)
- [Configuration](#️-configuration)
- [Utilisation](#-utilisation)
- [Structure du Projet](#-structure-du-projet)
- [Développement](#-développement)
- [Contribuer](#-contribuer)
- [Licence](#-licence)

---

## 🎯 À propos

**Hackaton MIA** (Managed Intelligence for Administration) est une plateforme d'automatisation conçue pour **traiter, valider et analyser les documents administratifs et comptables** en temps réel. 

Elle combine la puissance de l'**intelligence artificielle**, de la **vision par ordinateur** et du **machine learning** pour :

- ✨ **Extraire automatiquement** les données des documents (factures, devis, attestations, KBIS, RIB)
- 🔍 **Valider** la conformité selon les règles métier
- 🚨 **Détecter les fraudes** via des modèles d'anomalies
- 📊 **Archiver structurément** les données pour exploitation

---

## ✨ Fonctionnalités

### 📸 Capture & Traitement
- Téléchargement de documents (PDF, images)
- Stockage en 3 zones : **RAW** → **CLEAN** → **CURATED**
- Pagination et gestion de fichiers volumineux

### 🧠 Intelligence Artificielle
- **OCR avancé** (Tesseract) : Extraction de texte
- **MediaPipe/Vision** : Détection de structures documentaires
- **MLP Neural Network** : Classification des types de documents
- **Isolation Forest** : Détection d'anomalies

### 🔄 Orchestration
- **Airflow DAGs** : Pipelines de traitement automatisés
- **WebSocket** : Communication temps réel

### 🔐 Gestion
- Authentification JWT multi-rôles
- Contrôle d'accès granulaire (RBAC)
- Audit trail complet
- Conformité RGPD

### 📊 Dashboard Analytique
- Suivi d'extraction en temps réel
- Statistiques de conformité
- Alertes fraude
- Rapports d'export

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    📱 FRONTEND LAYER                            │
│              (React + Vite · Port 5173)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Dashboard │ Upload │ Consultation │ Rapports │ Profil   │   │
│  └──────────────────────────┬──────────────────────────────┘   │
└───────────────────────────────┼────────────────────────────────┘
                                │ HTTP/REST + WebSocket
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  🟢 BACKEND API LAYER                           │
│            (Node.js + Express · Port 3000)                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Auth Routes  │ Company CRUD  │ Document Upload │ API   │    │
│  │ User Mgmt    │ Validation    │ Analytics       │ REST  │    │
│  └────┬─────────────────────────────────────────────┬────┘    │
└───────┼───────────────────────────────────────────────┼────────┘
        │                                              │
        │ Queue/Events
        │
        ▼
┌──────────────────────────┐
│  🐍 PYTHON AI SERVICE    │
│  (FastAPI · Port 8000)   │
│                          │
│ 1. OCR Extraction        │
│ 2. Feature Extract       │
│ 3. MLP Classification    │
│ 4. Confidence Scoring    │
│ 5. Quality Assessment    │
│ 6. Validation & Anomalies│
└──────────────────────────┘
        │
        │ Processed Results
        ▼
        ┌──────────────────────────────┐
        │  📊 MongoDB Database          │
        │  (Port 27017)                │
        │  ├─ users                    │
        │  ├─ companies                │
        │  └─ documents                │
        └──────────────────────────────┘
                        │
                        ▼
        ┌──────────────────────────────┐
        │  ✈️ Airflow Orchestration     │
        │  (Port 8080)                 │
        │  └─ document_pipeline DAG    │
        └──────────────────────────────┘
```

### 🔄 Flux de Traitement d'un Document

```
1️⃣ UPLOAD
   Utilisateur télécharge un fichier
   ↓
2️⃣ STOCKAGE (zona RAW)
   Document stocké en format original
   ↓
3️⃣ OCR EXTRACTION
   Tesseract extrait le texte
   MediaPipe détecte les structures
   ↓
4️⃣ NETTOYAGE (zona CLEAN)
   Normalisation des données
   Correction des encodages
   ↓
5️⃣ CLASSIFICATION
   MLP détermine le type de document
   ↓
6️⃣ VALIDATION
   Vérification des règles métier
   Contrôles de conformité
   ↓
7️⃣ DÉTECTION FRAUDE
   Isolation Forest analyse les anomalies
   Scoring de risque (0-1)
   ↓
8️⃣ ARCHIVAGE (zona CURATED)
   Données prêtes pour exploitation
   ✅ Document traité et validé
```

---

## 🛠️ Technologies

### Frontend
- **React 19.2** - Bibliothèque UI
- **Vite 8.0** - Build tool ultra-rapide (380ms)
- **ESLint** - Linting JavaScript
- **CSS3 Modules** - Styling avancé

### Backend
| Tech | Version | Rôle |
|------|---------|------|
| **Node.js** | 20+ | Runtime |
| **Express** | 5.2 | Framework web |
| **MongoDB** | 7.0 | Base NoSQL |
| **Mongoose** | 9.0 | ODM |
| **JWT** | 9.0 | Auth |
| **Bcrypt** | 6.0 | Hashage |
| **Multer** | 2.1 | Upload |

### Intelligence Artificielle
| Tech | Version | Usage |
|------|---------|-------|
| **Python** | 3.12 | Langage IA |
| **PyTorch** | 2.0+ | Deep Learning |
| **FastAPI** | 0.104 | Framework async |
| **Tesseract** | 5.x | OCR |
| **MediaPipe** | 0.10 | Vision |
| **Scikit-learn** | 1.3 | ML classique |

### Infrastructure
- **Docker & Docker Compose** - Conteneurisation
- **Apache Airflow** - Orchestration DAGs
- **PostgreSQL 13** - Metadata Airflow
- **Git** - Version control

---

## 📦 Prérequis

### Logiciels Requis

```bash
# Versions minimales
Node.js ≥ 20.0.0
Python ≥ 3.12
Docker & Docker Compose ≥ 20.10
MongoDB ≥ 6.0
PostgreSQL ≥ 14 (optionnel)
```

### Installation des Prérequis

**macOS (Homebrew)**
```bash
brew install node python@3.12 docker postgresql git
```

**Ubuntu/Debian**
```bash
sudo apt-get install nodejs python3.12 docker.io postgresql git
```

**Windows**
- [Node.js](https://nodejs.org/)
- [Python 3.12](https://www.python.org/downloads/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git for Windows](https://git-scm.com/)

### GPU (Optionnel mais Recommandé)
Pour accélération PyTorch :
- **NVIDIA GPU** avec Compute Capability ≥ 3.5
- **CUDA 12.1** ([Installer](https://developer.nvidia.com/cuda-downloads))
- **cuDNN 8.9** ([Installer](https://developer.nvidia.com/cudnn))

---

## 🚀 Installation

### 1️⃣ Cloner le Repository

```bash
git clone https://github.com/your-org/hackaton-mia.git
cd hackaton-mia
```

### 2️⃣ Backend Node.js

```bash
cd backend

# Installer les dépendances
npm install

# Copier la config
cp .env.example .env

# Éditer .env avec vos paramètres
PORT=3000
MONGO_URI=mongodb://mongo:27017/hackathon
JWT_SECRET=your_secret_key_change_me
```

### 3️⃣ Service Python IA

```bash
cd ai_service

# Créer environnement virtuel
python -m venv venv
source venv/bin/activate  # macOS/Linux
# ou
venv\Scripts\activate    # Windows

# Installer dépendances
pip install -r requirements.txt

# ⚠️ Important : Le modèle MCL pré-entraîné doit être présent
# model/asl_alphabet.pth (télécharger ou entraîner)
```

### 4️⃣ Frontend

```bash
cd frontend

# Installer dépendances
npm install

# Créer .env.local
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
```

---

## 🎬 Démarrage

### Avec Docker Compose (⭐ Recommandé)

```bash
# Depuis la racine du projet
docker-compose up --build

# Ou en arrière-plan
docker-compose up -d --build
```

**Services lancés** :
- ✅ Frontend : http://localhost:5173
- ✅ Backend API : http://localhost:3000
- ✅ MongoDB : localhost:27017
- ✅ Airflow : http://localhost:8080
- ✅ Python AI : http://localhost:8000/docs

### Démarrage Manuel (4 Terminaux)

**Terminal 1 : Python IA Service**
```bash
cd ai_service
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
# ✅ API disponible sur http://localhost:8000/docs
```

**Terminal 2 : Backend Node.js**
```bash
cd backend
npm run dev
# ✅ Backend sur http://localhost:3000
```

**Terminal 3 : Frontend**
```bash
cd frontend
npm run dev
# ✅ App sur http://localhost:5173
```

**Terminal 4 : Création Admin**
```bash
cd backend
npm run seed:admin
# ✅ Admin créé : admin / Admin123!
```

### Vérifier le Démarrage

```bash
# Health checks
curl http://localhost:3000/health
curl http://localhost:8000/docs
curl http://localhost:5173

# Logs
docker-compose logs -f backend
docker-compose logs -f ai_service
```

---

## 🔍 Pipeline de Traitement

### Détails Techniques

### 📥 1. Upload Document
```javascript
// Frontend : envoi du fichier
const formData = new FormData();
formData.append('file', selectedFile);
formData.append('documentType', 'invoice');
formData.append('company', companyId);

fetch('/api/documents/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

### 🔍 2. OCR & Extraction (Python)
```python
# Tesseract + MediaPipe
def extract_data(image_path):
    # OCR text extraction
    text = pytesseract.image_to_string(image)
    
    # Keypoint detection
    results = detector.process(image)
    
    # Structure detection
    preprocessed = preprocess_document(image)
    return {
        'text': text,
        'keypoints': results.landmarks,
        'confidence': scorer.get_confidence()
    }
```

### 🧠 3. Classification MLP
```python
# 165 features → 256 → 128 → 26 classes
features = extract_hand_features(image)  # (165,)
output = model(torch.tensor(features))   # (26,) logits
prediction = torch.softmax(output, dim=0)
letter = alphabet[prediction.argmax()]
confidence = prediction.max().item()
```

### � 4. Validation & Anomalies
```javascript
// Backend validate
async function validateDocument(doc) {
  // Règles métier
  const validation = {
    hasRequiredFields: checkFields(doc),
    dateValid: isValidDate(doc.date),
    amountValid: isValidAmount(doc.amount),
    siretValid: isValidSiret(doc.siretFournisseur)
  };

  // ML Anomaly Detection
  const anomalies = fraudModel.detect(doc);
  
  return {
    status: validation.all ? 'valid' : 'invalid',
    anomalies: anomalies,
    riskScore: calculateRisk(anomalies)
  };
}
```

### 💾 5. Archivage (zona CURATED)
```javascript
// Document prêt pour exploitation
const finalDoc = {
  _id: ObjectId,
  filename: 'invoice_2024.pdf',
  status: 'completed',
  extractedData: {
    invoiceNumber: 'INV-2024-001',
    totalAmount: 1500.00,
    taxAmount: 300.00,
    vendor: { siret: '12345678901234', name: 'Acme Corp' }
  },
  validation: { status: 'valid', riskScore: 0.15 },
  createdAt: new Date(),
  updatedAt: new Date()
};
```

---

## ⚙️ Configuration

### Variables d'Environnement

#### Backend (`backend/.env`)
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://mongo:27017/hackathon
MONGO_USERNAME=
MONGO_PASSWORD=

# Auth
JWT_SECRET=your_super_secret_key
JWT_EXPIRY=24h

# Admin
ADMIN_EMAIL=admin@hackathon-mia.fr
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB

# Services
FRAUD_API_URL=http://localhost:5000
OCR_API_URL=http://localhost:8000
```

#### Python (`ai_service/.env`)
```env
# FastAPI
UVICORN_HOST=0.0.0.0
UVICORN_PORT=8000
UVICORN_RELOAD=true

# ML Model
MODEL_PATH=model/asl_alphabet.pth
DEVICE=cuda  # ou 'cpu'

# MongoDB
MONGODB_URI=mongodb://localhost:27017/hackathon
```

#### Frontend (`frontend/.env.local`)
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_ENV=development
```

---

## 🚀 Utilisation

### 1️⃣ Authentification

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hackathon-mia.fr",
    "password": "Admin123!"
  }'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@hackathon-mia.fr",
    "role": "admin"
  }
}
```

### 2️⃣ Créer une Entreprise

```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "siret": "12345678901234",
    "siren": "123456789",
    "tva": "FR12345678901",
    "email": "contact@acme.com",
    "phone": "+33123456789"
  }'
```

### 3️⃣ Télécharger un Document

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer <TOKEN>" \
  -F "file=@invoice.pdf" \
  -F "documentType=invoice" \
  -F "company=507f1f77bcf86cd799439011"
```

### 4️⃣ Lister les Documents

```bash
curl http://localhost:3000/api/documents \
  -H "Authorization: Bearer <TOKEN>"
```

### 5️⃣ Analyse de Fraude

```bash
curl -X POST http://localhost:3000/api/documents/analyze \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "507f1f77bcf86cd799439011"
  }'

# Response
{
  "riskScore": 0.23,
  "riskLevel": "low",
  "anomalies": []
}
```

---

## 📁 Structure du Projet

```
hackaton-mia/
├── 📱 frontend/
│   ├── src/
│   │   ├── components/           # Composants React
│   │   │   ├── Upload.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── DocumentList.jsx
│   │   ├── pages/                # Pages
│   │   ├── services/             # API client
│   │   └── styles/               # CSS modules
│   ├── vite.config.js
│   ├── package.json
│   ├── Dockerfile
│   └── README.md
│
├── 🟢 backend/
│   ├── src/
│   │   ├── routes/               # Routes Express
│   │   │   ├── auth.routes.js
│   │   │   ├── company.routes.js
│   │   │   └── document.routes.js
│   │   ├── controllers/          # Controllers
│   │   ├── models/               # Schémas Mongoose
│   │   │   ├── user.model.js
│   │   │   ├── company.model.js
│   │   │   └── document.model.js
│   │   ├── services/             # Business logic
│   │   ├── middlewares/          # Auth, validation
│   │   └── utils/                # Helpers
│   ├── websocket/                # WebSocket routes
│   ├── server.js                 # Entry point
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── 🐍 ai_service/
│   ├── main.py                   # FastAPI + WebSocket
│   ├── mediapipe_extractor.py    # ⭐ Feature extraction
│   ├── fraud_detector.py         # Isolation Forest
│   ├── model/
│   │   ├── asl_alphabet_mlp.py   # Architecture MLP
│   │   ├── asl_alphabet.pth      # Poids pré-entraînés
│   │   └── scaler.pkl
│   ├── datasets/                 # Training data
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml             # ⭐ Configuration Docker
├── .gitignore
├── README.md                      # Ce fichier
└── CONTRIBUTING.md
```

---

## 👨‍💻 Développement

### Commandes Utiles

```bash
# Frontend
cd frontend && npm run dev         # Dev avec hot reload
cd frontend && npm run build       # Build production
cd frontend && npm run lint        # ESLint check

# Backend
cd backend && npm run dev          # Nodemon watch
cd backend && npm run seed:admin   # Créer admin
cd backend && npm test             # Tests

# Python IA
cd ai_service && python main.py    # FastAPI
cd ai_service && pytest            # Tests

# Docker
docker-compose up --build          # Build & run all
docker-compose logs -f backend     # Logs
docker-compose down                # Stop all
```

### Style de Code

- ✅ ESLint pour JavaScript/TypeScript
- ✅ Black + Flake8 pour Python
- ✅ Commits atomiques avec messages clairs

### Debugging

**Python Logs**
```bash
# Voir tous les traitements
cd ai_service
LOGLEVEL=DEBUG python main.py
```

**Docker Logs**
```bash
docker-compose logs -f ai_service --until 300s
docker-compose logs backend | grep ERROR
```

**MongoDB**
```bash
# Accès direct
mongosh mongodb://localhost:27017/hackathon
db.documents.find({ status: 'failed' })
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! 

### Comment Contribuer

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/AmazingFeature`
3. **Commit** : `git commit -m 'Add: Amazing feature'`
4. **Push** : `git push origin feature/AmazingFeature`
5. **Pull Request** : Décrivez vos changements

### Guidelines

✅ Suivre les conventions de nommage  
✅ Ajouter des tests pour les nouvelles fonctionnalités  
✅ Documenter les changements  
✅ Vérifier que tous les services passent les tests  

Voir [CONTRIBUTING.md](CONTRIBUTING.md) pour plus de détails.

---

## 📄 Licence

Ce projet est sous licence **ISC**.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🙏 Remerciements

- [Apache Airflow](https://airflow.apache.org/) - Orchestration
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - OCR
- [MediaPipe](https://mediapipe.dev/) - Vision
- [Express.js](https://expressjs.com/) - Backend
- [React](https://react.dev/) - Frontend
- [PyTorch](https://pytorch.org/) - Deep Learning
- [Scikit-learn](https://scikit-learn.org/) - ML

Fait avec ❤️ et ☕ pour l'automatisation documentaire
