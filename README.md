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
Docker ≥ 20.10
Docker Compose ≥ 2.0
Git (pour cloner le repo)
```

Tout le reste (Node.js, Python, MongoDB, Airflow, etc.) est automatiquement installé dans les containers Docker.

### Installation de Docker

**Windows & macOS**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker & Compose)

**Linux (Ubuntu/Debian)**
```bash
# Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose git -y

# Donner permission user
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🚀 Installation

### 1️⃣ Cloner le Repository

```bash
git clone https://github.com/your-org/hackaton-mia.git
cd hackaton-mia
```

### 2️⃣ Configuration Docker (Optionnel)

Tous les services sont configurés automatiquement via `docker-compose.yml`. Pas d'installation manuelle requise !

---

## 🎬 Démarrage

### Avec Docker Compose (Seule Méthode Supportée)

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
- ✅ OCR API : http://localhost:8001/docs
- ✅ Fraud Detection : http://localhost:8002/docs

### Arrêter les Services

```bash
# Arrêter tous les containers
docker-compose down

# Arrêter et supprimer les volumes (reset complet)
docker-compose down -v
```

### Vérifier le Démarrage

```bash
# Health checks
curl http://localhost:3000/
curl http://localhost:8080/
curl http://localhost:5173/

# Logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f airflow
```
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

### Variables d'Environnement (Automatiques avec Docker)

Toutes les variables d'environnement sont pré-configurées dans `docker-compose.yml`. Les services communiquent entre eux via les noms de containers.

#### Fichiers de Configuration
```
├── docker-compose.yml       # Toute la config
├── backend/                 # Backend service
│   └── Dockerfile
├── airflow/                 # Airflow DAGs
│   ├── Dockerfile
│   └── dags/
├── ocr/                     # OCR service
│   └── Dockerfile
└── fraud_detection/         # Fraud detection service
    └── Dockerfile
```

#### Modification Configuration

Si vous voulez modifier des paramètres (ports, credentials, etc.), éditez `docker-compose.yml` :

```yaml
services:
  backend:
    environment:
      - MONGO_URI=mongodb://mongo:27017/hackathon
      - JWT_SECRET=your_secret_key
      - PORT=3000
```

Puis redémarrez :
```bash
docker-compose down
docker-compose up --build
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

### Commandes Docker

```bash
# Build & démarrer tous les services
docker-compose up --build

# Démarrer en arrière-plan
docker-compose up -d --build

# Afficher les logs
docker-compose logs -f                    # Tous les services
docker-compose logs -f backend            # Juste le backend
docker-compose logs -f airflow            # Juste Airflow
docker-compose logs -f ocr                # Juste l'OCR

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes (reset complet)
docker-compose down -v
```

### Modifier le Code

Les fichiers source sont montés en volumes. Les changements sont visibles directement :
```bash
# Modifier le code → changements appliqués automatiquement
vim backend/src/routes/auth.routes.js    # Hot reload activé

# Pour les changements qui nécessitent un rebuild
docker-compose restart backend
```

### Accéder aux Services
```bash
# Frontend
http://localhost:5173

# Backend API
http://localhost:3000
curl http://localhost:3000/

# MongoDB (depuis un container)
docker-compose exec mongo mongosh mongodb://127.0.0.1:27017/hackathon

# Airflow
http://localhost:8080

# Python APIs (Swagger)
http://localhost:8000/docs   # OCR
http://localhost:8001/docs   # Fraud Detection
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
