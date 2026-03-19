import requests
import io
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
from gridfs import GridIn
import gridfs
from bson import ObjectId
from pymongo import MongoClient

# Connexion Mongo
client = MongoClient("mongodb://mongo:27017")
db = client["hackathon"]


# -------------------------
# TASK 1 : FETCH DOCUMENT
# -------------------------
def fetch_document(**context):
    doc_id = context["dag_run"].conf.get("document_id")

    if not doc_id:
        raise Exception("No document_id provided")

    doc = db.rawdocuments.find_one({"_id": ObjectId(doc_id)})

    if not doc:
        raise Exception("Document not found")

    # Vérifie que le gridfsId existe dans le document
    if not doc.get("gridfsId"):
        raise Exception("No gridfsId found in document")

    db.rawdocuments.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"status": "processing"}}
    )

    # Passe aussi le gridfsId à la task suivante
    return {
        "doc_id": doc_id,
        "gridfs_id": str(doc["gridfsId"]),
        "mime_type": doc.get("mimeType", "application/pdf"),
        "filename": doc.get("filename", "document"),
    }


# -------------------------
# TASK 2 : OCR
# -------------------------
def ocr_task(**context):
    task_data = context["ti"].xcom_pull(task_ids="fetch_document")
    doc_id = task_data["doc_id"]
    gridfs_id = task_data["gridfs_id"]
    mime_type = task_data["mime_type"]
    filename = task_data["filename"]

    # --- Récupère le fichier depuis GridFS ---
    fs = gridfs.GridFS(db, collection="upload")
    grid_file = fs.get(ObjectId(gridfs_id))
    file_bytes = grid_file.read()

    # --- Envoie à l'API OCR ---
    ocr_response = requests.post(
        "http://ocr:8000/ocr",
        files={"file": (filename, io.BytesIO(file_bytes), mime_type)},
        timeout=60,
    )
    ocr_response.raise_for_status()
    ocr_result = ocr_response.json()

    # --- Insère dans cleandocuments ---
    clean_doc = db.cleandocuments.insert_one({
        "rawDocumentId": ObjectId(doc_id),
        "documentType": ocr_result.get("type"),
        "filename": ocr_result.get("filename"),
        "method": ocr_result.get("method"),
        "score": ocr_result.get("score"),
        "extracted": ocr_result.get("extracted", {}),
        "pages": ocr_result.get("pages", []),
        "fullText": ocr_result.get("full_text", ""),
        "status": "cleaned",
        "createdAt": datetime.utcnow(),
    })

    # --- Met à jour le statut dans rawdocuments ---
    db.rawdocuments.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"status": "ocr_done"}}
    )

    return {
        "doc_id": doc_id,
        "clean_doc_id": str(clean_doc.inserted_id),
        "document_type": ocr_result.get("type"),
    }


# -------------------------
# TASK 3 : CURATE
# -------------------------
def curate_task(**context):
    task_data = context["ti"].xcom_pull(task_ids="ocr_task")

    if task_data is None:
        raise Exception("xcom_pull('ocr_task') a retourné None")

    doc_id = task_data["doc_id"]
    clean_doc_id = task_data["clean_doc_id"]
    document_type = task_data["document_type"]

    # "clean_doc" = résultat du find_one
    clean_doc = db.cleandocuments.find_one({"_id": ObjectId(clean_doc_id)})

    if not clean_doc:
        raise Exception(f"cleandocument introuvable pour id: {clean_doc_id}")

    extracted = clean_doc.get("extracted", {})
    curated_data = normalize(document_type, extracted)

    # "curated_result" = résultat du insert_one  ← nom distinct
    curated_result = db.curateddocuments.insert_one({
        "rawDocumentId": ObjectId(doc_id),
        "cleanDocumentId": ObjectId(clean_doc_id),
        "documentType": document_type,
        "data": curated_data,
        "status": "curated",
        "createdAt": datetime.utcnow(),
    })

    db.rawdocuments.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"status": "done"}}
    )

    return {
        "doc_id": doc_id,
        "clean_doc_id": clean_doc_id,
        "curated_doc_id": str(curated_result.inserted_id),
        "document_type": document_type,
    }


# # -------------------------
# # TASK 4 : VALIDATION
# # -------------------------
def validate_task(**context):
    task_data = context["ti"].xcom_pull(task_ids="curate_task")

    if task_data is None:
        raise Exception("xcom_pull('curate_task') a retourné None")

    doc_id = task_data["doc_id"]
    clean_doc_id = task_data["clean_doc_id"]
    curated_doc_id = task_data["curated_doc_id"]
    document_type = task_data["document_type"]

    curated_doc = db.curateddocuments.find_one({"_id": ObjectId(curated_doc_id)})

    if not curated_doc:
        raise Exception(f"curateddocument introuvable pour id: {curated_doc_id}")

    # --- Construit le payload selon le type de document ---
    payload = build_validation_payload(document_type, curated_doc["data"])

    # --- Envoie à l'API de validation ---
    validation_response = requests.post(
        "http://fraud_api:8000/fraud/evaluate",
        json=payload,
        timeout=60,
    )
    validation_response.raise_for_status()
    validation_result = validation_response.json()

    fraud_score = validation_result.get("fraud_score", 0)
    anomaly_count = validation_result.get("anomaly_count", 0)
    is_anomaly = validation_result.get("ml_result", {}).get("is_anomaly", False)

    # Détermine le statut selon le score
    if fraud_score > 0.7 or is_anomaly:
        validation_status = "rejected"
    elif fraud_score > 0.4:
        validation_status = "suspicious"
    else:
        validation_status = "validated"

    # --- Met à jour curateddocuments avec le résultat ---
    db.curateddocuments.update_one(
        {"_id": ObjectId(curated_doc_id)},
        {"$set": {
            "validation": {
                "fraudScore": fraud_score,
                "anomalyCount": anomaly_count,
                "anomalies": validation_result.get("anomalies", []),
                "mlResult": validation_result.get("ml_result", {}),
            },
            "status": validation_status,
            "updatedAt": datetime.utcnow(),
        }}
    )

    # --- Met à jour le statut final dans rawdocuments ---
    db.rawdocuments.update_one(
        {"_id": ObjectId(doc_id)},
        {"$set": {"status": validation_status}}
    )

    return {
        "doc_id": doc_id,
        "curated_doc_id": curated_doc_id,
        "fraud_score": fraud_score,
        "validation_status": validation_status,
    }


def normalize(document_type, extracted):
    return extracted


def build_validation_payload(document_type, data):
    """Construit le payload selon le type de document."""
    if document_type == "invoice":
        return {
            "extraction": {
                "documentType": "invoice",
                "invoiceData": {
                    "invoiceNumber": data.get("numeroFacture"),
                    "issuerSiret": data.get("siret"),
                    "issuerTva": data.get("tva"),
                    "amount": data.get("montant", {}),
                    "issueDate": data.get("dateFacture"),
                    "dueDate": data.get("dateEcheance"),
                },
            },
            "include_cross_document": False,
        }
    elif document_type == "kbis":
        return {
            "extraction": {
                "documentType": "kbis",
                "kbisData": {
                    "siret": data.get("siret"),
                    "raisonSociale": data.get("raisonSociale"),
                    "formeJuridique": data.get("formeJuridique"),
                    "dirigeant": data.get("dirigeant"),
                },
            },
            "include_cross_document": False,
        }
    else:
        return {
            "extraction": {
                "documentType": document_type,
                "data": data,
            },
            "include_cross_document": False,
        }


# -------------------------
# DAG DEFINITION
# -------------------------
with DAG(
        dag_id="document_pipeline",
        start_date=datetime(2024, 1, 1),
        schedule_interval=None,
        catchup=False,
        tags=["hackathon", "ocr"]
) as dag:
    fetch = PythonOperator(
        task_id="fetch_document",
        python_callable=fetch_document
    )

    ocr = PythonOperator(task_id="ocr_task", python_callable=ocr_task)

    curate = PythonOperator(
        task_id="curate_task",
        python_callable=curate_task
    )

    validate = PythonOperator(
        task_id="validate_task",
        python_callable=validate_task
    )

    # Pipeline
    fetch >> ocr >> curate >> validate
