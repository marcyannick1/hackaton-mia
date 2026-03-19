import os

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB_NAME", "hackathon")


def get_db():
    from pymongo import MongoClient

    client = MongoClient(MONGO_URI)
    return client[DB_NAME]


# Thresholds and tuning knobs for business checks.
FRAUD_SCORE_THRESHOLD = float(os.getenv("FRAUD_SCORE_THRESHOLD", "0.5"))
OCR_CONFIDENCE_MIN = int(os.getenv("OCR_CONFIDENCE_MIN", "70"))
AMOUNT_TOLERANCE = float(os.getenv("AMOUNT_TOLERANCE", "0.01"))
TVA_RATE_TOLERANCE = float(os.getenv("TVA_RATE_TOLERANCE", "0.7"))
ATTESTATION_EXPIRY_WARNING_DAYS = int(
    os.getenv("ATTESTATION_EXPIRY_WARNING_DAYS", "30")
)
VALID_TVA_RATES = (0.0, 2.1, 5.5, 10.0, 20.0)