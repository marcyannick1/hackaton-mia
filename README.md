# 📄 Hackathon MIA 2026 : SmartDocs - Pipeline Documentaire Intelligent

Bienvenue sur le dépôt de notre projet pour le Hackathon MIA 2026.
L'objectif de cette plateforme est d'automatiser le traitement, la classification et l'extraction d'informations (OCR) à partir de documents administratifs hétérogènes (Factures, Kbis, RIB, Attestations SIRET/URSSAF).

---

## 🏗️ Architecture du Projet

Le projet est basé sur une architecture type **Data Lake (Raw / Clean / Curated)** orchestrée par des conteneurs isolés :

1. **Frontend (React)** : Interfaces simulées (CRM Fournisseur et Outil de Conformité).
2. **Backend (Node.js / Express)** : API REST gérant l'authentification (JWT), l'ingestion des fichiers bruts (`Raw Zone`) et la restitution des données structurées.
3. **Orchestrateur (Apache Airflow)** : Surveille les nouveaux uploads et pilote les étapes de traitement.
4. **Worker OCR (Python / FastAPI / Tesseract)** : Réalise les extractions de texte (`Clean Zone`) et la structuration métier (`Curated Zone`).
5. **Bases de Données** :
   - **MongoDB** : Stockage asynchrone des documents bruts et des extractions structurées.
   - **PostgreSQL** : Dédié à la métadonnée interne d'Apache Airflow.

---

## 🚀 Lancement Rapide

Le projet est entièrement "Dockerisé" pour garantir sa scalabilité et la simplicité du déploiement.

### Prérequis

- `Docker` et `Docker Compose` installés sur votre machine.

### Démarrage

À la racine du projet, exécutez la commande suivante :

```bash
docker-compose up --build -d
```

### Services & Accès Locaux

Une fois les conteneurs démarrés, vous pouvez accéder aux différents services :

- **Frontend (CRM)** : `http://localhost:5173` _(ou 3000 selon la config)_
- **Backend API Node** : `http://localhost:5000`
- **Interface Airflow** : `http://localhost:8080` (Identifiants : `admin` / `admin`)

---

## 📝 Workflow Principal

1. **Upload** : Un utilisateur (fournisseur) upload un document depuis le Frontend.
2. **Ingestion** : Le Backend Node.js sauvegarde le fichier (`RawDocument`) et lance un signal via l'API Airflow.
3. **Pipeline Airflow** : Un DAG s'exécute, il envoie le fichier au worker Python (Tesseract).
4. **Extraction** : Le worker extrait le texte, identifie les SIRET, les montants et teste les statuts de conformité.
5. **Restitution** : L'objet structuré (`Extraction`) est stocké dans MongoDB. Le Frontend l'affiche dynamiquement sur les fiches CRM.
