# API Documentation - Hackathon MIA (Med-Y API)

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
  - **Description** : Uploader un fichier PDF ou Image. Déclenche l'OCR FastAPI en arrière-plan et créé la liaison intelligente avec l'entreprise.
  - **Body (`multipart/form-data`)** :
    - `file` (Requis) : Le fichier physique.
    - `documentType` (Optionnel) : Le type présumé (sera écrasé par l'OCR si détecté de manière plus fiable).
    - `company` (Optionnel) : L'ID d'une entreprise existante (si ignoré, l'API cherchera par elle-même, ou créera un nouveau fournisseur).
  - **Réponse** : L'entité document sauvegardée avec son statut de traitement OCR.

- **`GET /documents`**
  - **Permissions** : `admin` uniquement.
  - **Description** : Liste l'intégralité des documents uploadés sur la plateforme.

- **`GET /documents/me`**
  - **Description** : Liste tous les documents uploadés par l'utilisateur courant.

- **`GET /documents/:id`**
  - **Permissions** : Propriétaire du document (`uploadedBy`) ou `admin`.
  - **Description** : Récupérer le détail complet (avec l'OCR `extractedData`) d'un document spécifique via son ID.

- **`DELETE /documents/:id`**
  - **Permissions** : Propriétaire du document (`uploadedBy`) ou `admin`.
  - **Description** : Suppression propre et complète d'un document (fichier physique retiré, extractions écrasées, `$pull` du document hors du fournisseur, puis suppression de la ligne Mongoose).

---

## 🏢 Companies (`/companies`)

Gestion des fournisseurs et entreprises détectés ou saisis.

- **`POST /companies`**
  - **Description** : Créer manuellement une entreprise. Si un SIRET identique est trouvé, retourne l'entreprise existante sans doublon.
  - **Body (JSON)** : `name` (Requis), `siret` (Requis - 14 chiffres), `siren`, `tva`, `email`, `address`, etc.

- **`GET /companies`**
  - **Description** : Récupérer toutes les entreprises de la BDD. Inclut le détail imbriqué des documents.

- **`GET /companies/:id`**
  - **Description** : Récupérer une entreprise spécifique via son ID.
