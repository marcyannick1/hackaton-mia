# API Documentation - Hackathon MIA

Ce document résumes les points d'accès (endpoints) disponibles sur le backend Node.js, ainsi que quelques commandes utiles pour l'administration.

Toutes les routes (hormis `/auth/login` et `/auth/register`) nécessitent un token JWT valide passé en header :
`Authorization: Bearer <votre_token>`

---

## 🛠️ Commandes d'Administration

Pour créer un premier utilisateur administrateur (nécessaire pour accéder à certaines routes restreintes comme `GET /users` ou `GET /documents`), vous pouvez lancer le script de "seed" prévu à cet effet.

À la racine du projet (où se situe le `docker-compose.yml`), exécutez la commande suivante :

```bash
docker-compose exec backend npm run seed:admin
```

Par défaut, les identifiants créés sont `admin / Admin123!`.
Vous pouvez les modifier au préalable en ajoutant ces variables dans le fichier `backend/.env` :

```env
ADMIN_EMAIL=admin@hackaton-mia.fr
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Admin123!
```

---

## 🔐 Auth (`/auth`)

Gestion de l'authentification et des sessions utilisateurs.

- **`POST /auth/sign-up`**
  - **Description** : Créer un nouvel utilisateur.
  - **Body (JSON)** : `email`, `username`, `password`, `department` (optionnel), `role` (optionnel, par défaut `viewer`).
  - **Réponse** : Token JWT & infos utilisateur.

- **`POST /auth/sign-in`**
  - **Description** : Connecter un utilisateur existant.
  - **Body (JSON)** : `email` ou `username`, `password`.
  - **Réponse** : Token JWT & infos utilisateur.

- **`GET /auth/me`**
  - **Permissions** : Utilisateur authentifié (Token requis).
  - **Description** : Permet au Frontend de récupérer les informations du profil complet (rôle, email, etc.) à partir du token lors d'un rafraîchissement de page.

---

## 👥 Users (`/users`)

Gestion des utilisateurs de la plateforme.

- **`GET /users`**
  - **Permissions** : `admin` uniquement.
  - **Description** : Liste tous les utilisateurs inscrits.

- **`GET /users/:id`**
  - **Permissions** : Utilisateur authentifié.
  - **Description** : Récupérer les détails d'un utilisateur précis par son ID.

---

## 📄 Documents (`/documents`)

Cœur de l'application : Upload, OCR automatisé, et Réconciliation.

- **`POST /documents/upload`**
  - **Description** : Uploader un fichier PDF ou Image. Le fichier est stocké dans **GridFS** (MongoDB). Déclenche le pipeline asynchrone **Apache Airflow** en arrière-plan.
  - **Body (`multipart/form-data`)** :
    - `file` (Requis) : Le fichier physique.
  - **Réponse** : Le document créé avec le statut initial `uploaded` et son `gridfsId`.

- **`GET /documents`**
  - **Permissions** : `admin` uniquement.
  - **Description** : Liste l'intégralité des métadonnées des documents uploadés.

- **`GET /documents/me`**
  - **Description** : Liste tous les documents uploadés par l'utilisateur courant.

- **`GET /documents/:id`**
  - **Permissions** : Propriétaire (`uploadedBy`) ou `admin`.
  - **Description** : Récupérer les métadonnées de base d'un document (nom, taille, statut `processing`/`done`).

- **`GET /documents/:id/curated`**
  - **Description** : **[NOUVEAU]** Récupère les données finales extraites et validées par **Airflow** (Données OCR, Montants, Statuts de fraude) pour ce document spécifique.

- **`DELETE /documents/:id`**
  - **Permissions** : Propriétaire (`uploadedBy`) ou `admin`.
  - **Description** : Suppression du document bruts et des métadonnées associées.

---

## 🏢 Companies (`/companies`)

> **Obsolète** : La collection `Company` a été retirée au profit d'une structure "Data Lake" dynamique. Les informations entreprises sont désormais déduites en temps réel par le Front-end en agrégeant les données des routes `/documents/:id/curated` filtrées par SIRET.
