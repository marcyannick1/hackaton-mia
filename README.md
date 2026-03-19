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

## 👥 Équipe

- **@ahmad** - Lead technique, Architecture & Backend
- **@team** - Full Stack Development

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

---

⬆️ [Retour en haut](#-hackaton-mia)
- [📦 Stack Technologique](#-stack-technologique)
- [🗂️ Structure du Projet](#-structure-du-projet)
- [⚡ Démarrage Rapide](#-démarrage-rapide)
- [🔧 Configuration](#-configuration)
- [📚 Documentation](#-documentation)
- [🚀 Utilisation](#-utilisation)
- [🔐 Authentification & Sécurité](#-authentification--sécurité)
- [📊 Base de Données](#-base-de-données)
- [🤖 Modules IA/ML](#-modules-iaml)
- [🐳 Déploiement avec Docker](#-déploiement-avec-docker)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## 🎯 Vue d'Ensemble

**Hackaton MIA** est une plateforme d'entreprise conçue pour **automatiser et valider les documents administratifs et comptables**. Elle combine plusieurs technologies pour offrir :

✅ **Extraction Intelligente de Données** - OCR avancé et traitement NLP  
✅ **Validation Automatique** - Vérification de conformité en temps réel  
✅ **Détection de Fraude** - Modèles ML pour identifier les anomalies  
✅ **Archivage Structuré** - Gestion documentaire organisée  
✅ **API Complète** - Intégration facile avec vos systèmes  
✅ **Interface Utilisateur Moderne** - Application React responsive  

### Cas d'Usage Principaux

- 📄 **Factures & Devis** - Extraction et validation automatique
- 🏛️ **Attestations** - SIRET, URSSAF, RIB
- 📋 **KBIS** - Documents d'enregistrement commerciaux
- 🔍 **Audit & Conformité** - Traçabilité complète et logs d'action
- 🚨 **Fraude** - Détection d'anomalies et d'inconsistances

---

## 🏗️ Architecture

### Diagramme Général

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│                                                                 │
│              ┌─── Frontend React + Vite ───┐                  │
│              │    (Port 5173)               │                  │
│              │    - Dashboard               │                  │
│              │    - Upload Documents        │                  │
│              │    - Consultation Données    │                  │
│              └──────────────┬────────────────┘                  │
└─────────────────────────────┼─────────────────────────────────┘
                              │
                              │ HTTP/REST
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY & BACKEND                        │
│                                                                 │
│         ┌──── Node.js/Express API ────┐                        │
│         │     (Port 3000)              │                        │
│         │                              │                        │
│         │  - Auth Routes               │                        │
│         │  - User Management           │                        │
│         │  - Company Management        │                        │
│         │  - Document Upload & OCR     │                        │
│         │  - Extraction Services       │                        │
│         │  - Fraud Detection API       │                        │
│         └────────────┬─────────────────┘                        │
└────────────────────────┼───────────────────────────────────────┘
                         │
        ┌────────────────┼─────────────────┐
        │                │                 │
        ▼                ▼                 ▼
┌──────────────┐  ┌─────────────┐  ┌────────────────────┐
│  MongoDB     │  │   Python    │  │  Airflow +         │
│  (Port 27017)│  │   Services  │  │  PostgreSQL        │
│              │  │             │  │  (Orchestration)   │
│ Collections: │  │ - OCR       │  │                    │
│  • users     │  │ - ML Models │  │ - DAG Pipeline     │
│  • companies │  │ - Validators│  │ - Task Scheduling  │
│  • documents │  │             │  │                    │
│  • extract.. │  │             │  │                    │
└──────────────┘  └─────────────┘  └────────────────────┘
```

### Flux de Traitement d'un Document

```
┌─────────────┐
│   Upload    │ Utilisateur télécharge un document
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Stockage (RAW)  │ Document stocké dans la zone 'raw'
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Extraction     │ OCR + Extraction de données
│   (Tesseract)   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Nettoyage      │ Normalisation des données
│  (CLEAN)        │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Validation     │ Vérification de conformité
│  (Rules Engine) │
└──────┬──────────┘
       │
       ▼
┌───────────────────────┐
│ Détection de Fraude   │ Modèle ML (Isolation Forest)
│ (Anomaly Detection)   │
└──────┬────────────────┘
       │
       ▼
┌─────────────────────┐
│ Archivage (CURATED) │ Données prêtes pour utilisation
└─────────────────────┘
```

---

## 📦 Stack Technologique

### Frontend
- **React 19.2** - Bibliothèque UI
- **Vite 8.0** - Build tool ultra-rapide
- **ESLint** - Linting du code JavaScript
- **CSS Moderne** - Styling responsive

### Backend
- **Node.js 16+** - Runtime JavaScript côté serveur
- **Express 5.2** - Framework web minimaliste
- **MongoDB 7.0** - Base de données NoSQL
- **Mongoose 9.0** - ODM pour MongoDB
- **JWT (jsonwebtoken)** - Authentification securisée
- **Bcrypt** - Hashage de mots de passe
- **Multer** - Téléchargement de fichiers
- **Joi** - Validation de données

### Data & ML
- **Python 3.8+** - Langage pour services de traitement
- **Tesseract OCR** - Extraction de texte depuis images
- **Scikit-learn** - Modèles ML classiques
- **Pandas** - Manipulation de données
- **Faker** - Génération de données de test

### Orchestration & Infrastructure
- **Apache Airflow** - Orchestration des workflows
- **PostgreSQL 13** - BD pour Airflow metadata
- **Docker & Docker Compose** - Conteneurisation

---

## 🗂️ Structure du Projet

```
hackaton-mia/
│
├── 📂 frontend/                    # Application React
│   ├── src/
│   │   ├── components/             # Composants React
│   │   ├── pages/                  # Pages principales
│   │   ├── App.jsx                 # Composant root
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Styles globaux
│   ├── public/                     # Assets statiques
│   ├── vite.config.js              # Configuration Vite
│   ├── eslint.config.js            # Configuration ESLint
│   ├── package.json                # Dépendances Node
│   ├── Dockerfile                  # Image Docker
│   └── README.md                   # Documentation frontend
│
├── 📂 backend/                     # API Node.js/Express
│   ├── src/
│   │   ├── controllers/            # Logique métier des endpoints
│   │   │   ├── auth.controller.js
│   │   │   ├── user.controller.js
│   │   │   ├── company.controller.js
│   │   │   └── document.controller.js
│   │   ├── routes/                 # Définition des routes API
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── company.routes.js
│   │   │   └── document.routes.js
│   │   ├── models/                 # Schémas Mongoose
│   │   │   ├── user.model.js
│   │   │   ├── company.model.js
│   │   │   └── document.model.js
│   │   ├── services/               # Services métier
│   │   │   ├── auth.service.js
│   │   │   ├── user.service.js
│   │   │   ├── company.service.js
│   │   │   └── document.service.js
│   │   ├── middlewares/            # Middlewares Express
│   │   │   ├── authenticate.middleware.js
│   │   │   ├── authorize.middleware.js
│   │   │   ├── upload.middleware.js
│   │   │   └── validation.middleware.js
│   │   ├── dtos/                   # Data Transfer Objects
│   │   │   ├── auth.dtos.js
│   │   │   ├── user.dtos.js
│   │   │   ├── company.dtos.js
│   │   │   └── document.dtos.js
│   │   ├── utils/                  # Utilitaires
│   │   └── data/                   # Données statiques
│   │       └── documents.json
│   ├── config/
│   │   └── database.config.js      # Configuration MongoDB
│   ├── scripts/
│   │   └── seedAdmin.js            # Script d'initialisation
│   ├── docs/                       # Documentation
│   │   ├── INDEX.md
│   │   ├── QUICK_START.md
│   │   ├── SETUP.md
│   │   ├── ARCHITECTURE.md
│   │   ├── COLLECTIONS.md
│   │   ├── API_ENDPOINTS.md
│   │   └── API_EXAMPLES.md
│   ├── server.js                   # Point d'entrée
│   ├── package.json                # Dépendances Node
│   ├── Dockerfile                  # Image Docker
│   ├── .env.example                # Template config
│   ├── cheatsheet.txt              # Aide-mémoire
│   └── README.md                   # Documentation backend
│
├── 📂 ocr/                         # Service OCR Python
│   ├── ocr.py                      # Modules OCR
│   ├── extract.py                  # Extraction de données
│   ├── requirements.txt            # Dépendances Python
│   ├── Dockerfile                  # Image Docker
│   ├── docs/                       # Exemples de documents
│   └── README.md                   # Documentation OCR
│
├── 📂 fraud_detection/             # Service de détection de fraude
│   ├── api.py                      # API Flask pour la détection
│   ├── fraud_pipeline.py           # Pipeline d'analyse
│   ├── anomaly_detection.py        # Modèles de détection
│   ├── cross_document_validator.py # Validation multi-docs
│   ├── feature_engineering.py      # Extraction de features
│   ├── validation_rules.py         # Règles de validation
│   ├── utils.py                    # Utilitaires
│   ├── config.py                   # Configuration
│   ├── requirements.txt            # Dépendances Python
│   ├── Dockerfile                  # Image Docker
│   ├── data/                       # Données d'entraînement
│   ├── model/                      # Modèles sauvegardés
│   ├── scripts/
│   │   ├── train_model.py          # Entraînement du modèle
│   │   └── seed_test_data.py       # Génération de données test
│   └── README.md                   # Documentation fraude
│
├── 📂 airflow/                     # Orchestration Airflow
│   ├── dags/
│   │   └── document_pipeline.py    # DAG principal
│   ├── requirements.txt            # Dépendances Python
│   ├── Dockerfile                  # Image Docker
│   └── README.md                   # Documentation Airflow
│
├── 📂 dataset-generation/          # Générateur de données
│   ├── generate_fake_data.py       # Génération de données
│   ├── data-generation.py          # Script principal
│   ├── templates/                  # Templates HTML
│   │   ├── facture.html
│   │   ├── devis.html
│   │   ├── attestation_siret.html
│   │   ├── attestation_urssaf.html
│   │   ├── kbis.html
│   │   └── rib.html
│   ├── entreprises.csv             # Liste d'entreprises
│   ├── entreprises_cas_usage.csv
│   └── README.md                   # Documentation génération
│
├── 📂 ml/                          # Modules ML avancés
│   └── README.md                   # Documentation ML
│
├── 📂 data/                        # Cas d'usage & données
│   ├── cas_usage/
│   │   ├── attestation_siret/
│   │   ├── attestation_urssaf/
│   │   ├── devis/
│   │   ├── factures/
│   │   ├── kbis/
│   │   └── rib/
│   ├── output/                     # Résultats traitement
│   └── README.md                   # Documentation données
│
├── 📂 .git/                        # Historique Git
│
├── docker-compose.yml              # Orchestration conteneurs
├── .gitignore                      # Fichiers à ignorer
├── package-lock.json               # Lock npm
├── user.json                       # Données utilisateur test
└── README.md                       # Ce fichier
```

---

## ⚡ Démarrage Rapide

### Prérequis

- **Docker & Docker Compose** (v20.10+) - [Installer](https://docs.docker.com/get-docker/)
- **Node.js** (v16+) - [Installer](https://nodejs.org/)
- **Git** - [Installer](https://git-scm.com/)
- **Python** (3.8+) pour les services locaux - [Installer](https://www.python.org/)

### 1️⃣ Cloner le Dépôt

```bash
git clone https://github.com/your-org/hackaton-mia.git
cd hackaton-mia
```

### 2️⃣ Lancer avec Docker Compose (Recommandé)

```bash
# Construire et lancer tous les services
docker-compose up --build

# En arrière-plan
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down
```

### 3️⃣ Accéder aux Services

Une fois les conteneurs lancés :

- 🌐 **Frontend**: http://localhost:5173
- 🔌 **Backend API**: http://localhost:3000
- 🗄️ **MongoDB**: mongodb://localhost:27017
- ✈️ **Airflow UI**: http://localhost:8080 (si activé)

### 4️⃣ Configuration Admin Initial

Pour créer un utilisateur administrateur :

```bash
# Depuis le répertoire racine (avec Docker Compose)
docker-compose exec backend npm run seed:admin

# Ou localement dans le dossier backend
cd backend
npm run seed:admin
```

**Identifiants par défaut** :
- Username: `admin`
- Password: `Admin123!`

---

## 🔧 Configuration

### Variables d'Environnement

#### Backend (`.env`)

```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://mongo:27017/hackathon
MONGO_USERNAME=
MONGO_PASSWORD=

# JWT
JWT_SECRET=your_super_secret_key_change_me_in_production
JWT_EXPIRY=24h

# Admin
ADMIN_EMAIL=admin@hackathon-mia.fr
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!

# Storage
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=50MB

# Fraud Detection Service
FRAUD_API_URL=http://localhost:5000
FRAUD_API_ENABLED=true

# OCR Service
OCR_API_URL=http://localhost:8001
OCR_API_ENABLED=true
```

#### Frontend (`.env.local`)

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

#### Python Services (`.env`)

```env
MONGODB_URI=mongodb://mongo:27017/hackathon
FLASK_ENV=development
FLASK_PORT=5000
```

### Fichier .env.example

Un fichier `.env.example` est fourni dans le dossier `backend/`. Copiez-le et adaptez les valeurs :

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos configurations
```

---

## 📚 Documentation

### 📖 Documentation du Backend

- [QUICK_START.md](backend/docs/QUICK_START.md) - Démarrage rapide
- [SETUP.md](backend/docs/SETUP.md) - Configuration complète
- [ARCHITECTURE.md](backend/docs/ARCHITECTURE.md) - Architecture système
- [COLLECTIONS.md](backend/docs/COLLECTIONS.md) - Schémas MongoDB
- [API_ENDPOINTS.md](backend/docs/API_ENDPOINTS.md) - Endpoints disponibles
- [API_EXAMPLES.md](backend/docs/API_EXAMPLES.md) - Exemples d'utilisation

### 📖 Documentation par Module

- [OCR](ocr/README.md) - Service d'extraction de texte
- [Fraud Detection](fraud_detection/README.md) - Détection de fraude
- [Dataset Generation](dataset-generation/README.md) - Génération de données
- [Airflow](airflow/README.md) - Orchestration des pipelines

---

## 🚀 Utilisation

### 1️⃣ S'Authentifier

```bash
# S'inscrire
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "operator"
  }'

# Se connecter
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "operator"
  }
}
```

### 2️⃣ Créer une Entreprise

```bash
curl -X POST http://localhost:3000/api/companies \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corporation",
    "siret": "12345678901234",
    "siren": "123456789",
    "tva": "FR12345678901",
    "address": "123 Rue de la Paix, 75000 Paris",
    "email": "contact@acme.com",
    "phone": "+33123456789"
  }'
```

### 3️⃣ Télécharger un Document

```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -F "file=@invoice.pdf" \
  -F "documentType=invoice" \
  -F "companyId=<COMPANY_ID>"
```

### 4️⃣ Consulter les Documents

```bash
# Lister tous les documents
curl -X GET http://localhost:3000/api/documents \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Obtenir les détails d'un document
curl -X GET http://localhost:3000/api/documents/<DOCUMENT_ID> \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 5️⃣ Analyser pour Fraude

```bash
curl -X POST http://localhost:5000/api/fraud/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": "<DOCUMENT_ID>",
    "extracted_data": {...}
  }'

# Réponse
{
  "risk_score": 0.75,
  "risk_level": "high",
  "anomalies": [
    {
      "type": "amount_mismatch",
      "severity": "high",
      "description": "Le montant HT ne correspond pas au total"
    }
  ]
}
```

---

## 🔐 Authentification & Sécurité

### Mécanisme JWT

- Tous les endpoints (sauf `/auth/login` et `/auth/register`) nécessitent un token JWT
- Le token doit être passé dans le header: `Authorization: Bearer <token>`
- La durée d'expiration est configurable (par défaut: 24h)

### Rôles & Permissions

```javascript
// Rôles disponibles
const ROLES = {
  ADMIN: 'admin',           // Accès complet
  VALIDATOR: 'validator',   // Validation documents
  OPERATOR: 'operator',     // Opérateur standard
  VIEWER: 'viewer'          // Lecture seule
};

// Middlewares d'autorisation
router.get('/admin-only', 
  authenticate, 
  authorize(['admin']), 
  controller.adminFunction
);
```

### Meilleures Pratiques

✅ **À FAIRE** :
- Stocker le token dans `localStorage` ou les cookies sécurisés
- Utiliser HTTPS en production
- Renouveler les tokens régulièrement
- Hasher tous les mots de passe avec bcrypt
- Valider les entrées côté serveur

❌ **À NE PAS FAIRE** :
- Stocker les tokens en texte clair
- Utiliser HTTP en production
- Envoyer les mots de passe en texte clair
- Exposer les erreurs sensibles aux clients

---

## 📊 Base de Données

### Collections MongoDB

#### 👤 Collection `users`

```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  role: String, // 'admin', 'validator', 'operator', 'viewer'
  department: String,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 🏢 Collection `companies`

```javascript
{
  _id: ObjectId,
  name: String,
  siret: String (unique),
  siren: String,
  tva: String,
  address: String,
  email: String,
  phone: String,
  iban: String,
  bic: String,
  complianceStatus: String, // 'compliant', 'pending', 'non-compliant'
  attestationExpiry: Date,
  documents: [ObjectId], // Références aux documents
  createdAt: Date,
  updatedAt: Date
}
```

#### 📄 Collection `documents`

```javascript
{
  _id: ObjectId,
  filename: String,
  documentType: String, // 'invoice', 'attestation', 'kbis', etc.
  company: ObjectId, // Référence company
  uploadedBy: ObjectId, // Référence user
  status: String, // 'uploaded', 'processing', 'completed', 'failed'
  storageZone: String, // 'raw', 'clean', 'curated'
  extractedData: {
    // Données structurées extraites
  },
  ocrText: String, // Texte brut OCR
  isValidated: Boolean,
  validatedBy: ObjectId,
  confidence: Number, // Score 0-1
  fraudAnalysis: {
    riskScore: Number,
    riskLevel: String,
    anomalies: [Object]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Requêtes Utiles

```javascript
// Trouver tous les documents non validés
db.documents.find({ isValidated: false })

// Documents avec risque de fraude élevé
db.documents.find({ 'fraudAnalysis.riskLevel': 'high' })

// Entreprises avec statut non conforme
db.companies.find({ complianceStatus: 'non-compliant' })

// Statistiques
db.documents.aggregate([
  { $group: { _id: '$documentType', count: { $sum: 1 } } }
])
```

---

## 🤖 Modules IA/ML

### 1️⃣ OCR (Optical Character Recognition)

**Service**: `ocr/` (Python + Tesseract)

**Fonctionnalités** :
- Extraction de texte depuis images et PDF
- Support de multiples langages
- Normalisation des données extraites

**Utilisation** :
```bash
cd ocr
pip install -r requirements.txt
python extract.py --file document.pdf
```

### 2️⃣ Détection de Fraude

**Service**: `fraud_detection/` (Python + scikit-learn)

**Modèles** :
- **Isolation Forest** - Détection d'anomalies
- **Règles de validation** - Vérification métier
- **Validateur multi-documents** - Analyse cross-document

**Anomalies détectées** :
- Montants incohérents
- Dates invalides
- Références d'entreprise incorrectes
- Patterns suspects

**Entraînement du modèle** :
```bash
cd fraud_detection
pip install -r requirements.txt
python scripts/train_model.py
```

**API Fraude** :
```bash
python api.py  # Lance le serveur Flask port 5000
```

### 3️⃣ Dataset Generation

**Service**: `dataset-generation/` (Python + Faker)

Génère des données de test réalistes :
- Documents PDF simulés
- Données d'entreprises
- Templates variés (factures, devis, attestations)

**Utilisation** :
```bash
cd dataset-generation
python data-generation.py --count 100 --template invoice
```

### 4️⃣ Airflow (Orchestration)

**Service**: `airflow/` (DAGs pour orchestration)

**DAG Principal** :
- `document_pipeline.py` - Pipeline complet de traitement

**Tâches** :
1. Téléchargement & validation
2. OCR & extraction
3. Nettoyage données
4. Analyse fraude
5. Archivage

**Accès** :
- UI: http://localhost:8080
- Username: `airflow`
- Password: `airflow`

---

## 🐳 Déploiement avec Docker

### Architecture Docker Compose

```yaml
Services:
├── frontend (React, Port 5173)
├── backend (Node.js, Port 3000)
├── mongo (MongoDB, Port 27017)
├── postgres (Airflow metadata, Port 5432)
├── airflow-scheduler (Orchestration)
└── airflow-webserver (Airflow UI, Port 8080)
```

### Commandes Utiles

```bash
# Construire les images
docker-compose build

# Lancer tous les services
docker-compose up

# Lancer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Exécuter une commande dans un conteneur
docker-compose exec backend npm run seed:admin

# Arrêter tous les services
docker-compose down

# Supprimer les volumes (données)
docker-compose down -v

# Reconstruire une image spécifique
docker-compose up --build frontend
```

### Gestion des Volumes

```bash
# Voir les volumes
docker volume ls

# Nettoyer les volumes inutilisés
docker volume prune

# Inspecter un volume
docker volume inspect hackaton-mia_mongo_data
```

---

## Développement Local

### Sans Docker

#### 1️⃣ Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
# API sur http://localhost:3000
```

#### 2️⃣ Frontend

```bash
cd frontend
npm install
npm run dev
# Application sur http://localhost:5173
```

#### 3️⃣ Services Python

```bash
# OCR
cd ocr
pip install -r requirements.txt
python ocr.py

# Fraude
cd fraud_detection
pip install -r requirements.txt
python scripts/train_model.py
python api.py
```

#### 4️⃣ MongoDB

```bash
# Installer MongoDB Community Edition
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install mongodb
# Windows: Télécharger depuis mongodb.com

# Lancer MongoDB
mongod
```

---

## 🧪 Tests & Validation

### Teste les Endpoints

```bash
# Health Check
curl http://localhost:3000/health

# Créer un utilisateur
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Lister les utilisateurs (admin uniquement)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### Données de Test

Utiliser le fichier `user.json` pour charger des données de test :

```json
{
  "users": [
    {
      "username": "operator1",
      "email": "operator@example.com",
      "password": "Op123!",
      "role": "operator"
    }
  ],
  "companies": [
    {
      "name": "Test Company",
      "siret": "12345678901234"
    }
  ]
}
```

---

## 📈 Performance & Optimisation

### Recommandations

- **Frontend** : Lazy loading, code splitting, caching
- **Backend** : Indexation MongoDB, pagination, compression
- **ML** : Sérialisation des modèles, batch processing

### Monitoring

```bash
# Monitorer les ressources Docker
docker stats

# Logs détaillés
docker-compose logs --follow backend

# Statut des services
docker-compose ps
```

---

## 🤝 Contribution

### Comment Contribuer

1. **Fork** le dépôt
2. **Créer une branche** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

### Standards de Code

- ✅ Suivre les conventions ESLint
- ✅ Nommer les variables/fonctions en anglais
- ✅ Documenter les fonctions complexes
- ✅ Ajouter des tests
- ✅ Respecter la structure des dossiers

### Signaler des Bugs

Utilisez l'onglet **Issues** avec les informations :
- Description du bug
- Étapes de reproduction
- Comportement attendu vs. réel
- Environnement (OS, versions, etc.)

---

## 🗺️ Roadmap

### Phase 1 (Actuelle)
- ✅ APIs CRUD pour documents
- ✅ OCR basique avec Tesseract
- ✅ Détection fraude simple (Isolation Forest)
- ✅ Interface React minimaliste

### Phase 2
- 🔄 Amélioration OCR (modèles ML avancés)
- 🔄 Dashboard analytique
- 🔄 Notifications temps réel
- 🔄 Export rapports

### Phase 3
- 📅 APIs externes (Impôts, Banques)
- 📅 Machine learning avancé (Deep Learning)
- 📅 Signature électronique
- 📅 Conformité RGPD complète

---

## 📞 Support & Contact

### Ressources

- 📖 Documentation - [Consulter](backend/docs/INDEX.md)
- 🐛 Issues - [Signaler un bug](https://github.com/your-org/hackaton-mia/issues)
- 💬 Discussions - [Communiquer](https://github.com/your-org/hackaton-mia/discussions)

### Équipe

- **Architecture** - Lead technique
- **Backend** - API et Base de données
- **Frontend** - Interface utilisateur
- **ML/Data** - Modèles et pipelines

### Email de Support

admin@hackathon-mia.fr

---

## 📄 Licence

Ce projet est sous licence **ISC** - Voir le fichier [LICENSE](LICENSE) pour plus de détails.

The ISC License is a permissive license, which means you can freely use this software in your projects with minimal restrictions.

---

## 🙏 Remerciements

- [Apache Airflow](https://airflow.apache.org/) - Orchestration
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - Extraction de texte
- [Express.js](https://expressjs.com/) - Framework web
- [React](https://react.dev/) - Bibliothèque UI
- [MongoDB](https://www.mongodb.com/) - Base de données
- [Scikit-learn](https://scikit-learn.org/) - Machine Learning

---

## 📝 Notes Importantes

### Sécurité

⚠️ **NE JAMAIS** :
- Commiter les fichiers `.env` avec des secrets
- Utiliser des mots de passe par défaut en production
- Exposer les tokens JWT
- Désactiver la validation

### Performance

- Optimiser les requêtes MongoDB avec indexes
- Utiliser la pagination pour les listes longues
- Cacher les réponses fréquentes
- Monitorer la mémoire des services Python

### Maintenance

- Mettre à jour les dépendances régulièrement
- Archiver les anciens logs
- Nettoyer les données de test
- Sauvegarder les bases de données

---

**Dernière mise à jour** : *Mars 2026*  
**Version** : 1.0.0  
**Mainteneurs** : Équipe MIA Hackathon
