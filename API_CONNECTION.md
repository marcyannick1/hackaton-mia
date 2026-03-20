# Connexion API - Documentation

## Résumé des changements

La connexion entre le **frontend** et le **backend** a été complètement intégrée. Voici ce qui a été mis en place :

### 1. **Backend (server.js - Port 3000)**

Routes disponibles :
- **Auth** : `/auth/sign-in`, `/auth/sign-up`, `/auth/me`
- **Users** : `/users`, `/users/me/profile`, `/users/me/password`
- **Companies** : `/companies` (CRUD)
- **Documents** : `/documents`, `/documents/me`, `/documents/upload`

### 2. **Frontend - CRM Fournisseur**

#### Fichiers modifiés :
- `src/services/api.js` - Service axios avec tous les endpoints API
- `src/context/AuthContext.jsx` - Authentification avec API réelle
- `src/context/FournisseurContext.jsx` - Gestion des fournisseurs via API
- `src/hooks/useDocuments.js` - Upload et gestion des documents
- `src/components/auth/LoginForm.jsx` - Formulaire de connexion (async)
- `src/components/auth/RegisterFournisseurForm.jsx` - Inscription (async)
- `src/components/upload/UploadZone.jsx` - Upload de fichiers
- `src/pages/UploadPage.jsx` - Page d'upload
- `.env.example` - Configuration de l'API

### 3. **Frontend - Outil de Conformité**

#### Fichiers modifiés :
- `src/services/api.js` - Service axios (nouveau fichier)
- `src/context/AuthContext.jsx` - Authentification avec API réelle
- `src/components/auth/LoginForm.jsx` - Formulaire de connexion (async)
- `src/components/auth/RegisterForm.jsx` - Inscription (async)
- `.env.example` - Configuration de l'API

---

## Configuration requise

### Backend
```bash
cd backend
npm install
# Créer un fichier .env avec les variables du .env.example
# Important: JWT_SECRET doit être défini
npm run dev
```

Port : **3000**

### Frontend CRM
```bash
cd frontend/crm-fournisseur
npm install
# Créer un fichier .env:
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

### Frontend Conformité
```bash
cd frontend/outil-conformite
npm install
# Créer un fichier .env:
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

---

## Flux d'authentification

### Login
1. L'utilisateur rentre email/password dans le formulaire
2. `POST /auth/sign-in` est appelé via `authAPI.signIn()`
3. Token JWT retourné et stocké dans localStorage (`crm_user` ou `conformite_user`)
4. Token ajouté automatiquement à tous les appels API via `api.interceptors.request`

### Inscription
1. L'utilisateur remplit le formulaire d'inscription
2. `POST /auth/sign-up` est appelé avec les données
3. Un compte utilisateur est créé
4. Pour le CRM : Une fiche fournisseur (company) est créée automatiquement

### Logout
- Token supprimé de localStorage
- Utilisateur redirigé vers `/login`

---

## API - Détails des endpoints

### Auth
```javascript
POST /auth/sign-in
Body: { email, password }
Response: { user, token }

POST /auth/sign-up  
Body: { name, email, password, role }
Response: { user, token }

GET /auth/me
Response: { user }
```

### Companies
```javascript
GET /companies - Liste tous les fournisseurs
GET /companies/:id - Détail d'un fournisseur
POST /companies - Crée un fournisseur
PUT /companies/:id - Met à jour
```

### Documents
```javascript
GET /documents/me - Mes documents
POST /documents/upload - Upload un fichier
DELETE /documents/:id - Supprime un document
```

---

## Hooks disponibles

### `useAuth()`
```javascript
const { user, login, registerFournisseur, logout, error, loading } = useAuth();

await login(email, password); // Returns boolean
await registerFournisseur(formData); // Returns boolean
logout();
```

### `useFournisseur()`
```javascript
const { fournisseurs, selected, setSelected, updateFournisseur } = useFournisseur();

await updateFournisseur(id, data); // Returns boolean
```

### `useDocuments()`
```javascript
const { documents, uploading, upload, remove, loadDocuments } = useDocuments();

await upload(files, metadata); // Returns boolean
await remove(docId); // Supprime un document
loadDocuments(); // Recharge la liste
```

---

## Interception des erreurs

Les erreurs d'authentification (401) sont gérées automatiquement :
- Utilisateur déconnecté
- LocalStorage vidé
- Redirection vers `/login`

Les autres erreurs affichent le message du serveur (`err.response?.data?.message`).

---

## Variables d'environnement

### Backend (.env)
```
MONGO_URI=mongodb://mongo:27017/hackathon
API_PORT=3000
NODE_ENV=development
JWT_SECRET=votre_secret_jwt
OCR_SERVICE_URL=http://ocr:8000/ocr
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

---

## Points importants

✅ **Fait** :
- Connexion login/register aux endpoints backend
- Gestion des tokens JWT
- Upload de documents via FormData
- Filtrage des fournisseurs par rôle
- Intercepteurs pour l'authentification
- Gestion des erreurs

⚠️ **À vérifier** :
- Les schémas MongoDB/contrôleurs du backend
- Les permissions/rôles pour les routes admin
- La configuration CORS si les frontends sont sur des ports différents

---

## Dépannage

**Erreur "VITE_API_URL not defined"** :
→ Créer un fichier .env avec `VITE_API_URL=http://localhost:3000`

**Erreur 401 lors du login** :
→ Vérifier que le backend est démarré et que les credentials sont corrects

**Erreur CORS** :
→ Vérifier la configuration de la variable API_URL et que le backend autorise les requêtes cross-origin

