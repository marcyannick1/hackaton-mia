## ⚡ QUICK START - Collections MongoDB

✅ **Les 4 collections MongoDB sont prêtes à l'emploi!**

### 📦 Installation Express

```bash
cd backend
npm install
```

### ▶️ Lancer le serveur

```bash
# Développement
npm run dev

# Ou avec Docker Compose (du dossier racine)
docker-compose up --build
```

### 🧪 Tester une collection

```bash
# Health check
curl http://localhost:3000/health

# Créer un utilisateur
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "ahmed",
    "email": "ahmed@company.com",
    "password": "test123",
    "role": "operator"
  }'

# Créer une entreprise
curl -X POST http://localhost:3000/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme",
    "siret": "12345678901234",
    "tva": "FR12345678901"
  }'
```

### 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| [COLLECTIONS.md](./COLLECTIONS.md) | 📋 Schémas détaillés + examples |
| [SETUP.md](./SETUP.md) | 🚀 Installation + architecture |
| [API_EXAMPLES.md](./API_EXAMPLES.md) | 🔌 Tous les endpoints avec exemples |

### 🎯 Collections Créées

```
✅ users         → Opérateurs, admins
✅ companies     → Fournisseurs avec SIRET/TVA
✅ documents     → Factures, attestations, RIB
✅ extractions   → Données OCR + incohérences
```

### 🔗 Relations

```
User → uploads/validates → Document
Company ← referenced by → Document
Document → generates → Extraction
Extraction → detects → Inconsistencies (SIRET, expiry, etc)
```

### 🛠️ Prochaines Étapes

1. ✅ Collections MongoDB créées
2. 🔄 Routes CRUD disponibles (à tester)
3. 🔄 Intégrer Tesseract OCR
4. 🔄 Créer DAGs Airflow
5. 🔄 Connecter Frontend React

### 📖 File Structure

```
backend/
├── config/database.js     ← Connexion MongoDB
├── models/                ← Schemas (User, Company, Document, Extraction)
├── index.js               ← Routes Express
├── COLLECTIONS.md         ← Doc complète
├── SETUP.md              ← Guide installation
├── API_EXAMPLES.md       ← Exemples cURL
└── package.json          ← Dependencies: mongoose, dotenv
```

### 💡 Tips

- Les mots de passe sont **ignorés** dans les réponses GET (select: false)
- Le SIRET est **unique** (numéro officiel d'entreprise - 14 chiffres)
- TVA format: **FR** + 11 chiffres (ex: FR12345678901)
- storageZone: raw → clean → curated (flow d'OCR)

---

**Status**: ✅ Ready to go! Les collections sont prêtes pour l'intégration OCR et Airflow.
