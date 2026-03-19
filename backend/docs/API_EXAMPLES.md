# Exemples de Réponses API (Payloads)

Ce fichier fournit au Frontend des exemples complets et réels de ce que l'API renvoie, incluant tous les champs générés par Mongoose (dates, versions, statuts de traitement, etc.).

---

## 🔐 Auth (`/auth`)

### `POST /auth/sign-up`

**Réponse (201 Created)** :

```json
{
  "error": false,
  "message": "Utilisateur créé avec succès.",
  "statusCode": 201
}
```

### `POST /auth/sign-in`

**Réponse (200 OK)** :

```json
{
  "error": false,
  "message": "Vous êtes désormais connecté.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR..."
  },
  "statusCode": 200
}
```

### `GET /auth/me`

**Réponse (200 OK)** :

```json
{
  "error": false,
  "message": "Profil récupéré avec succès.",
  "data": {
    "_id": "69b98bb9bf30ba2fa0c28cca",
    "username": "Admin Utilisateur",
    "email": "admin@exemple.com",
    "role": "admin",
    "department": "Direction",
    "isActive": true,
    "lastLogin": "2026-03-18T15:26:41.955Z",
    "createdAt": "2026-03-17T17:13:29.313Z",
    "updatedAt": "2026-03-18T15:26:41.956Z"
  },
  "statusCode": 200
}
```

---

## 👥 Users (`/users`)

### `GET /users`

**Réponse (200 OK)** :

```json
{
  "error": false,
  "message": "Utilisateurs récupérés avec succès",
  "data": [
    {
      "_id": "69b98bb9bf30ba2fa0c28cca",
      "username": "Admin Utilisateur",
      "email": "admin@exemple.com",
      "role": "admin",
      "department": "Direction",
      "isActive": true,
      "lastLogin": "2026-03-18T16:04:41.478Z",
      "createdAt": "2026-03-17T17:13:29.313Z",
      "updatedAt": "2026-03-18T16:04:41.478Z",
      "__v": 0
    },
    {
      "_id": "69bacc0fab41c5c4fedf4b09",
      "username": "Operateur Test",
      "email": "test@exemple.com",
      "role": "operator",
      "department": "General",
      "isActive": true,
      "lastLogin": null,
      "createdAt": "2026-03-18T16:00:15.670Z",
      "updatedAt": "2026-03-18T16:00:15.670Z",
      "__v": 0
    }
  ]
}
```

---

## 📄 Documents & OCR (`/documents`)

### `POST /documents/upload`

**Réponse (201 Created)** :  
_L'OCR a traité le document en arrière-plan et a initié l'extraction._

```json
{
  "error": false,
  "message": "Document uploadé avec succès",
  "data": {
    "document": {
      "filename": "invoice-1773847589679-308763739.pdf",
      "originalName": "FACTURE_EXEMPLE.pdf",
      "fileSize": 6771,
      "filePath": "/app/src/uploads/invoice-1773847589679-308763739.pdf",
      "fileType": "pdf",
      "mimeType": "application/pdf",
      "documentType": "rib",
      "company": "69bac4269ce8acd84c5bb77c",
      "uploadedBy": "69b98bb9bf30ba2fa0c28cca",
      "status": "completed",
      "ocrText": "ENTREPRISE EXEMPLE\n\n2 RUE DE LA PAIX\n\n75001 PARIS\n\nSiret : 12345678901234 Code Naf : 2042Z...",
      "confidence": 0,
      "isValidated": false,
      "storageZone": "raw",
      "errors": [],
      "_id": "69bac4259ce8acd84c5bb773",
      "createdAt": "2026-03-18T15:26:29.690Z",
      "updatedAt": "2026-03-18T15:26:30.850Z",
      "__v": 0,
      "extractedData": "69bac4259ce8acd84c5bb775"
    },
    "extractionId": "69bac4259ce8acd84c5bb775"
  },
  "statusCode": 201
}
```

### `GET /documents/me`

**Réponse (200 OK)** :  
_Note : Renvoie uniquement les documents appartenant à l'utilisateur connecté._

```json
{
  "error": false,
  "message": "Documents récupérés avec succès",
  "data": [
    {
      "_id": "69babddc65b18ccb90220440",
      "filename": "invoice-1773845980312-233951215.pdf",
      "originalName": "FICHIER_EXEMPLE.pdf",
      "fileSize": 6771,
      "filePath": "/app/src/uploads/invoice-1773845980312-233951215.pdf",
      "fileType": "pdf",
      "mimeType": "application/pdf",
      "documentType": "rib",
      "company": null,
      "uploadedBy": "69b98bb9bf30ba2fa0c28cca",
      "status": "completed",
      "ocrText": "ENTREPRISE EXEMPLE\n\n2 RUE DE LA PAIX\n\n75001 PARIS\n\nSiret : 12345678901234",
      "confidence": 0,
      "isValidated": false,
      "storageZone": "raw",
      "errors": [],
      "createdAt": "2026-03-18T14:59:40.326Z",
      "updatedAt": "2026-03-18T14:59:41.400Z",
      "__v": 0,
      "extractedData": {
        "extractedData": {
          "siret": null,
          "tva": null
        },
        "invoiceData": {
          "currency": "EUR",
          "lines": []
        },
        "ribData": {
          "iban": null,
          "bic": null,
          "accountHolder": null,
          "bankName": null
        },
        "_id": "69babddc65b18ccb90220442",
        "document": "69babddc65b18ccb90220440",
        "documentType": "rib",
        "extractionMethod": "ocr",
        "inconsistencies": [],
        "status": "in_review",
        "processingLog": [],
        "createdAt": "2026-03-18T14:59:40.332Z",
        "updatedAt": "2026-03-18T14:59:41.403Z",
        "__v": 0
      }
    }
  ]
}
```

### `GET /documents`

**Réponse (200 OK)** :  
_Note : Observez la richesse du sous-objet `extractedData` peuplé par Mongoose `populate()`._

```json
{
  "error": false,
  "message": "Documents récupérés avec succès",
  "data": [
    {
      "_id": "69bac4259ce8acd84c5bb773",
      "filename": "invoice-1773847589679-308763739.pdf",
      "originalName": "FACTURE_EXEMPLE.pdf",
      "fileSize": 6771,
      "filePath": "/app/src/uploads/invoice-1773847589679-308763739.pdf",
      "fileType": "pdf",
      "mimeType": "application/pdf",
      "documentType": "rib",
      "company": "69bac4269ce8acd84c5bb77c",
      "uploadedBy": "69b98bb9bf30ba2fa0c28cca",
      "status": "completed",
      "ocrText": "ENTREPRISE EXEMPLE\n\n2 RUE DE LA PAIX\n\n75001 PARIS\n\nSiret : 12345678901234",
      "confidence": 0,
      "isValidated": false,
      "storageZone": "raw",
      "errors": [],
      "createdAt": "2026-03-18T15:26:29.690Z",
      "updatedAt": "2026-03-18T15:26:30.850Z",
      "__v": 0,
      "extractedData": {
        "extractedData": {
          "siret": "12345678901234",
          "tva": null
        },
        "invoiceData": {
          "currency": "EUR",
          "lines": []
        },
        "ribData": {
          "iban": null,
          "bic": null,
          "accountHolder": null,
          "bankName": null
        },
        "_id": "69bac4259ce8acd84c5bb775",
        "document": "69bac4259ce8acd84c5bb773",
        "documentType": "rib",
        "extractionMethod": "ocr",
        "inconsistencies": [],
        "status": "in_review",
        "processingLog": [],
        "createdAt": "2026-03-18T15:26:29.696Z",
        "updatedAt": "2026-03-18T15:26:30.837Z",
        "__v": 0
      }
    }
  ]
}
```

### `GET /documents/:id`

**Réponse (200 OK)** :
_Note : Récupère toutes les informations d'un document spécifique ainsi que son extractedData._

```json
{
  "error": false,
  "message": "Document récupéré avec succès",
  "data": {
    "_id": "69bac4259ce8acd84c5bb773",
    "filename": "invoice-1773847589679-308763739.pdf",
    "originalName": "FICHIER_EXEMPLE.pdf",
    "fileSize": 6771,
    "filePath": "/app/src/uploads/invoice-1773847589679-308763739.pdf",
    "fileType": "pdf",
    "mimeType": "application/pdf",
    "documentType": "rib",
    "company": "69bac4269ce8acd84c5bb77c",
    "uploadedBy": "69b98bb9bf30ba2fa0c28cca",
    "status": "completed",
    "ocrText": "ENTREPRISE EXEMPLE\n\n2 RUE DE LA PAIX\n\n75001 PARIS\n\nSiret : 12345678901234 Code Naf : 2042Z\nUrssaf/Msa : 287000005520692814\n\nMonsieur John DOE\n2 RUE DE LA PAIX\n75001 PARIS\n\nENTREPRISE EXEMPLE\n\nSalaire de base (55 %) 151.67 991.01\nSalaire brut 991.01\nTotal des cotisations et contributions 18.78 24.22.\nMontant net social 972.23\nNet payé 972.23",
    "createdAt": "2026-03-18T15:26:29.690Z",
    "updatedAt": "2026-03-18T15:26:30.850Z",
    "__v": 0,
    "extractedData": {
      "_id": "69bac4259ce8acd84c5bb775",
      "document": "69bac4259ce8acd84c5bb773",
      "documentType": "rib",
      "extractionMethod": "ocr",
      "status": "in_review",
      "extractedData": {
        "siret": "12345678901234",
        "tva": null
      },
      "invoiceData": {
        "currency": "EUR",
        "lines": []
      },
      "ribData": {
        "iban": null,
        "bic": null,
        "accountHolder": null,
        "bankName": null
      },
      "inconsistencies": [],
      "processingLog": [],
      "createdAt": "2026-03-18T15:26:29.696Z",
      "updatedAt": "2026-03-18T15:26:30.837Z",
      "__v": 0
    }
  },
  "statusCode": 200
}
```

---

## 🏢 Companies (`/companies`)

### `POST /companies`

**Réponse (201 Created)** :

```json
{
  "error": false,
  "message": "Entreprise créée avec succès",
  "data": {
    "name": "BTP Services SAS",
    "siret": "12345678901234",
    "address": {
      "country": "FR"
    },
    "email": "contact@exemple.fr",
    "complianceStatus": "unknown",
    "documents": [],
    "_id": "69bacdc0ab41c5c4fedf4b12",
    "createdAt": "2026-03-18T16:07:28.856Z",
    "updatedAt": "2026-03-18T16:07:28.856Z",
    "__v": 0
  }
}
```

### `GET /companies`

**Réponse (200 OK)** :
_(Notez comment la propriété `documents` est peuplée avec la liste de tous les documents rattachés)_

```json
{
  "error": false,
  "message": "Entreprises récupérées avec succès",
  "data": [
    {
      "address": {
        "country": "FR"
      },
      "_id": "69ba704d136446c6d990b26c",
      "name": "BTP Services SAS",
      "siret": "12345678905555",
      "email": "contact@exemple.fr",
      "complianceStatus": "unknown",
      "documents": [],
      "createdAt": "2026-03-18T09:28:45.564Z",
      "updatedAt": "2026-03-18T09:38:07.139Z",
      "__v": 0
    }
  ]
}
```

### `GET /companies/:id`

**Réponse (200 OK)** :
_(L'objet document est maintenant lui-même "deep-populated" avec `extractedData` !)_

```json
{
  "error": false,
  "message": "Entreprise récupérée avec succès",
  "data": {
    "address": {
      "country": "FR"
    },
    "_id": "69bac4269ce8acd84c5bb77c",
    "name": "Nouveau Fournisseur",
    "siret": "12345678901234",
    "complianceStatus": "unknown",
    "documents": [
      {
        "_id": "69bac4259ce8acd84c5bb773",
        "filename": "invoice-1773847589679-308763739.pdf",
        "originalName": "FACTURE_EXEMPLE.pdf",
        "fileSize": 6771,
        "filePath": "/app/src/uploads/invoice-1773847589679-308763739.pdf",
        "fileType": "pdf",
        "mimeType": "application/pdf",
        "documentType": "rib",
        "company": "69bac4269ce8acd84c5bb77c",
        "uploadedBy": "69b98bb9bf30ba2fa0c28cca",
        "status": "completed",
        "ocrText": "ENTREPRISE EXEMPLE...",
        "createdAt": "2026-03-18T15:26:29.690Z",
        "updatedAt": "2026-03-18T15:26:30.850Z",
        "__v": 0,
        "extractedData": {
          "extractedData": {
            "siret": "12345678901234",
            "tva": null
          },
          "invoiceData": {
            "currency": "EUR",
            "lines": []
          },
          "ribData": {
            "iban": null,
            "bic": null,
            "accountHolder": null,
            "bankName": null
          },
          "_id": "69bac4259ce8acd84c5bb775",
          "document": "69bac4259ce8acd84c5bb773",
          "documentType": "rib",
          "extractionMethod": "ocr",
          "inconsistencies": [],
          "status": "in_review",
          "processingLog": [],
          "createdAt": "2026-03-18T15:26:29.696Z",
          "updatedAt": "2026-03-18T15:26:30.837Z",
          "__v": 0
        }
      }
    ],
    "createdAt": "2026-03-18T15:26:30.847Z",
    "updatedAt": "2026-03-18T15:26:30.851Z",
    "__v": 0
  }
}
```
