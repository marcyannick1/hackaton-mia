# Hackaton MIA

Plateforme de traitement automatisé de documents administratifs et comptables avec détection de fraude par IA.

**Stack** : React · Node.js · Python · MongoDB · Docker · Apache Airflow

---

## Table des matières

- [À propos](#à-propos)
- [Architecture](#architecture)
- [Technologies](#technologies)
- [Documents supportés](#documents-supportés)
- [Prérequis](#prérequis)
- [Installation et démarrage](#installation-et-démarrage)
- [Services et ports](#services-et-ports)
- [Pipeline de traitement](#pipeline-de-traitement)
- [Détection de fraude](#détection-de-fraude)
- [API — Principaux endpoints](#api--principaux-endpoints)
- [Structure du projet](#structure-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [Génération de données de test](#génération-de-données-de-test)

---

## À propos

**Hackaton MIA** (Managed Intelligence for Administration) est une plateforme d'automatisation intelligente qui traite, valide et analyse des documents administratifs (factures, devis, attestations, KBIS, RIB, URSSAF) en temps réel.

Elle s'appuie sur :
- Un **OCR neuronal** basé sur `python-doctr` + PyTorch pour extraire le texte des documents PDF et images
- Une **API de détection de fraude** combinant règles métier (65 %) et machine learning — Isolation Forest (35 %)
- Un **pipeline Airflow** en 8 étapes pour orchestrer le traitement de bout en bout
- Une **architecture 3 zones** : RAW → CLEAN → CURATED pour la gestion des données documentaires
- Deux interfaces React distinctes selon le profil utilisateur (CRM fournisseur / outil de conformité)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  FRONTEND 1 — CRM Fournisseur      (Port 5173)          │
│  FRONTEND 2 — Outil de Conformité  (Port 5174)          │
│              React 18 + Vite + Tailwind CSS             │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP/REST
                      ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND API  (Port 3000)                   │
│              Node.js 22 + Express 5 + Mongoose 9        │
│  Authentification JWT  |  Upload Multer  |  GridFS      │
└──────┬──────────────────────────────────────────────────┘
       │                         │
       ▼                         ▼
┌─────────────┐         ┌────────────────────────┐
│  MongoDB 7  │         │  Airflow  (Port 8080)   │
│ (Port 27017)│         │  DAG: document_pipeline │
│  GridFS     │         └────────┬───────────────┘
└─────────────┘                  │
                                 │ orchestre les tâches
                       ┌─────────┴──────────┐
                       ▼                    ▼
              ┌─────────────────┐  ┌─────────────────────┐
              │  OCR Service    │  │  Fraud Detection API │
              │  (Port 8000)    │  │  (Port 8001)         │
              │  FastAPI+doctr  │  │  FastAPI+scikit-learn│
              └─────────────────┘  └─────────────────────┘
```

### Flux de traitement d'un document

```
1. Upload utilisateur → Backend API
   ↓
2. Stockage MongoDB GridFS → status = "processing"
   ↓
3. Déclenchement DAG Airflow (document_id)
   ↓
4. OCR — extraction du texte via doctr/PyTorch
   ↓
5. Nettoyage et normalisation des données
   ↓
6. Classification du type de document
   ↓
7. Validation métier (montants, dates, SIRET, TVA, RIB…)
   ↓
8. Détection d'anomalies ML (Isolation Forest)
   ↓
9. Score de fraude combiné (65 % règles + 35 % ML)
   ↓
10. Stockage dans curatedDocuments → status = "completed" | "suspicious"
```

---

## Technologies

### Frontends

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.2 | Interface utilisateur |
| Vite | 5.0 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| React Router | 6.22 | Navigation |
| Axios | 1.6 | Requêtes HTTP |

Deux applications indépendantes :
- `frontend/crm-fournisseur` — gestion des fournisseurs et de leurs documents (port 5173)
- `frontend/outil-conformite` — outil de vérification de conformité documentaire (port 5174)

### Backend (Node.js)

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 22 | Runtime |
| Express | 5.2 | Framework web |
| Mongoose | 9.0 | ODM MongoDB |
| JWT | 9.0 | Authentification |
| Bcrypt | 6.0 | Hashage des mots de passe |
| Multer | 2.1 | Gestion des uploads |
| Joi | 18.0 | Validation des données |

### Services Python

**OCR** (`ocr/`, port 8000)
- FastAPI + Uvicorn
- `python-doctr[torch]` — OCR neuronal (PyTorch) pour PDF et images
- Extraction de champs spécialisée par type de document (`extract.py`)

**Fraud Detection** (`fraud_detection/`, port 8001)
- FastAPI + Uvicorn
- scikit-learn 1.3 — Isolation Forest pour la détection d'anomalies
- pymongo — accès direct MongoDB
- rapidfuzz — comparaison floue de chaînes (noms, adresses)
- NumPy — feature engineering

### Infrastructure

| Service | Technologie | Rôle |
|---------|-------------|------|
| Base de données principale | MongoDB 7 + GridFS | Stockage documents et fichiers binaires |
| Orchestration | Apache Airflow 2 | DAG de traitement documentaire |
| Base Airflow | PostgreSQL 13 | Métadonnées Airflow |
| Conteneurisation | Docker + Docker Compose | Déploiement unifié de tous les services |

---

## Documents supportés

| Type | Champs extraits |
|------|-----------------|
| Facture | Numéro, date, vendeur, acheteur, lignes, montants HT/TVA/TTC |
| Devis | Numéro, date, client, lignes, montants, validité |
| KBIS | Raison sociale, SIREN, SIRET, adresse, forme juridique, date immatriculation |
| RIB | Titulaire, IBAN, BIC, banque |
| Attestation | Type, émetteur, bénéficiaire, période de validité |
| URSSAF | Entreprise, période, cotisations, attestation de régularité |

---

## Prérequis

- Docker et Docker Compose ≥ 20.10
- *(optionnel — développement manuel)* Node.js ≥ 20, Python ≥ 3.11

---

## Installation et démarrage

### Avec Docker Compose (recommandé)

```bash
git clone <url-du-repo>
cd hackaton-mia

docker-compose up --build
```

Tous les services démarrent automatiquement. Attendre que l'init d'Airflow soit terminée (~1 min) avant d'utiliser le pipeline.

### Démarrage manuel (développement)

**Backend**
```bash
cd backend
cp .env.example .env   # adapter les variables
npm install
npm run dev
```

**OCR Service**
```bash
cd ocr
pip install -r requirements.txt
uvicorn ocr:app --host 0.0.0.0 --port 8000 --reload
```

**Fraud Detection**
```bash
cd fraud_detection
pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend CRM**
```bash
cd frontend/crm-fournisseur
npm install
npm run dev   # http://localhost:5173
```

**Frontend Conformité**
```bash
cd frontend/outil-conformite
npm install
npm run dev   # http://localhost:5174
```

**Créer le compte admin initial**
```bash
cd backend
npm run seed:admin
```

---

## Services et ports

| Service | Port | URL |
|---------|------|-----|
| Frontend CRM fournisseur | 5173 | http://localhost:5173 |
| Frontend outil de conformité | 5174 | http://localhost:5174 |
| Backend API | 3000 | http://localhost:3000 |
| OCR Service (Swagger) | 8000 | http://localhost:8000/docs |
| Fraud Detection API (Swagger) | 8001 | http://localhost:8001/docs |
| Airflow | 8080 | http://localhost:8080 |
| MongoDB | 27017 | mongodb://localhost:27017 |

Identifiants Airflow par défaut : `admin` / `admin`

---

## Pipeline de traitement

Le DAG `document_pipeline` dans Airflow orchestre 8 tâches séquentielles :

| # | Tâche | Description |
|---|-------|-------------|
| 1 | `fetch_document` | Récupère le fichier depuis MongoDB GridFS via le `document_id` |
| 2 | `ocr_task` | Envoie le fichier au service OCR (`POST /ocr`), reçoit les champs extraits |
| 3 | `clean_data` | Normalise les valeurs (montants, dates, codes postaux, SIRET) |
| 4 | `classify_document` | Détermine le type de document (facture, KBIS, RIB, etc.) |
| 5 | `validate_rules` | Applique les règles métier (cohérence TVA, calculs, dates, format SIRET) |
| 6 | `fraud_detection` | Envoie à l'API de fraude (`POST /fraud/evaluate`) |
| 7 | `compute_score` | Calcule le score final : 65 % règles + 35 % Isolation Forest |
| 8 | `store_result` | Sauvegarde dans `curatedDocuments`, met à jour le statut du document |

Déclenchement manuel depuis l'interface Airflow avec la configuration :
```json
{ "document_id": "<ObjectId MongoDB>" }
```

---

## Détection de fraude

Le moteur de fraude (`fraud_detection/`) combine deux approches :

### Règles métier (`validation_rules.py` — 390+ lignes)
- Cohérence des calculs : HT × TVA = TTC
- Validité du format SIRET/SIREN (algorithme de Luhn)
- Contrôle IBAN/BIC (RIB)
- Vérification des dates (expiration attestations, dates futures)
- Champs obligatoires par type de document
- Correspondance inter-documents (nom société vs KBIS, IBAN vs RIB déclaré)

### Machine Learning (`anomaly_detection.py`)
- Modèle : **Isolation Forest** (scikit-learn)
- Features : montants, ratios TVA, densité de texte, métadonnées temporelles
- Entraînement : `fraud_detection/scripts/train_model.py`
- Modèle sérialisé dans `fraud_detection/model/`

### Score final
```
score_fraude = (score_règles × 0.65) + (score_ml × 0.35)
```
- `score < 0.3` → document valide
- `0.3 ≤ score < 0.7` → à vérifier manuellement
- `score ≥ 0.7` → document suspect

---

## API — Principaux endpoints

### Authentification
```
POST   /auth/login          Corps : { email, password }  → token JWT
POST   /auth/signup         Corps : { email, password, role }
GET    /auth/me             Header : Authorization: Bearer <token>
```

### Entreprises
```
GET    /companies           Liste des entreprises
POST   /companies           Créer une entreprise
GET    /companies/:id       Détail d'une entreprise
PUT    /companies/:id       Mettre à jour
GET    /companies/search    Recherche par SIRET, nom…
```

### Documents
```
POST   /documents/upload    Multipart : fichier + company_id
GET    /documents           Liste des documents de l'utilisateur
GET    /documents/:id       Détail + résultats OCR/fraude
```

### OCR Service (port 8000)
```
POST   /ocr                 Multipart : fichier PDF ou image → champs extraits (JSON)
```

### Fraud Detection API (port 8001)
```
POST   /fraud/evaluate      Corps : { document_type, extracted_fields, … } → score + détails
```

---

## Structure du projet

```
hackaton-mia/
├── frontend/
│   ├── crm-fournisseur/        # App React — CRM fournisseurs (port 5173)
│   │   ├── src/
│   │   │   ├── components/     # Composants UI
│   │   │   ├── pages/          # Pages de l'application
│   │   │   ├── services/       # Appels API (axios)
│   │   │   ├── context/        # AuthContext, FournisseurContext
│   │   │   └── hooks/          # useAuth, useDocuments, useFournisseur
│   │   ├── vite.config.js
│   │   └── Dockerfile
│   └── outil-conformite/       # App React — conformité (port 5174)
│       └── ...                 # même structure
│
├── backend/                    # API Node.js/Express (port 3000)
│   ├── server.js               # Point d'entrée
│   ├── config/
│   │   └── database.config.js
│   └── src/
│       ├── routes/             # auth, company, document, user
│       ├── controllers/        # Logique métier
│       ├── models/             # user, company, document, curatedDocument
│       ├── middlewares/        # JWT, autorisation, validation, upload
│       ├── services/           # Appels services externes
│       ├── dtos/               # Objets de transfert de données
│       ├── scripts/            # seedAdmin.js
│       └── uploads/            # Fichiers uploadés
│
├── ocr/                        # Service OCR Python/FastAPI (port 8000)
│   ├── ocr.py                  # Endpoint POST /ocr — pipeline doctr
│   ├── extract.py              # Extraction de champs par type de document
│   ├── requirements.txt
│   └── Dockerfile
│
├── fraud_detection/            # API détection de fraude (port 8001)
│   ├── api.py                  # Endpoint POST /fraud/evaluate
│   ├── anomaly_detection.py    # Isolation Forest
│   ├── validation_rules.py     # Règles métier (390+ lignes)
│   ├── cross_document_validator.py  # Détection d'incohérences inter-docs
│   ├── feature_engineering.py  # Extraction de features ML
│   ├── fraud_pipeline.py       # Pipeline de bout en bout
│   ├── config.py               # Constantes (seuils, tolérances)
│   ├── model/                  # Modèles entraînés (Isolation Forest + scaler)
│   ├── scripts/
│   │   ├── train_model.py      # Entraînement du modèle
│   │   └── seed_test_data.py   # Données de test
│   ├── requirements.txt
│   └── Dockerfile
│
├── airflow/                    # Orchestration Airflow (port 8080)
│   ├── dags/
│   │   └── document_pipeline.py  # DAG 8 tâches
│   ├── requirements.txt
│   └── Dockerfile
│
├── dataset-generation/         # Génération de données synthétiques
│   ├── data-generation.py      # Génération de documents PDF/images
│   ├── generate_fake_data.py   # Données entreprises via Faker
│   ├── templates/              # Templates de documents
│   ├── entreprises.csv         # Référentiel entreprises
│   └── requirements.txt
│
├── data/                       # Données de référence et cas d'usage
│   ├── cas_usage/              # Scénarios de test réels
│   └── output/                 # Résultats de traitement
│
├── docker-compose.yml          # Orchestration complète (9 services)
├── API_CONNECTION.md           # Guide d'intégration API
└── README.md
```

---

## Variables d'environnement

### Backend (`backend/.env`)

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://mongo:27017/hackathon
JWT_SECRET=your_secret_key
ADMIN_EMAIL=admin@hackathon-mia.fr
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
OCR_SERVICE_URL=http://ocr:8000/ocr
```

### Fraud Detection (`fraud_detection/.env`)

```env
MONGO_URI=mongodb://mongo:27017
MONGO_DB_NAME=hackathon
```

Les services OCR et Airflow n'ont pas de fichier `.env` — leur configuration est injectée via `docker-compose.yml`.

---

## Génération de données de test

Le dossier `dataset-generation/` contient des scripts pour créer des documents synthétiques réalistes :

```bash
cd dataset-generation
pip install -r requirements.txt

# Générer des entreprises fictives
python generate_fake_data.py

# Générer des documents PDF (factures, KBIS, RIB…)
python data-generation.py
```

Les templates PDF sont dans `dataset-generation/templates/`. Les données de référence (codes NAF, formes juridiques) sont incluses sous forme de fichiers CSV/XLS.
