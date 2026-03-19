from __future__ import annotations

from pathlib import Path
import sys
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


CURRENT_DIR = Path(__file__).resolve().parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.append(str(CURRENT_DIR))

from anomaly_detection import AnomalyDetector
from cross_document_validator import CrossDocumentValidator
from feature_engineering import build_features
from utils import compute_rules_score, dedupe_anomalies
from validation_rules import ValidationRules


class EvaluateRequest(BaseModel):
    extraction: dict[str, Any]
    document: dict[str, Any] = Field(default_factory=dict)
    include_cross_document: bool = True


app = FastAPI(
    title="Fraud Detection API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

detector = AnomalyDetector()



@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Fraud Detection API is running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.post("/fraud/evaluate")
def evaluate(request: EvaluateRequest) -> dict[str, Any]:
    try:
        document = request.document or {}
        rules = ValidationRules(request.extraction, document)
        anomalies: list[dict[str, Any]] = rules.run()

        if request.include_cross_document:
            from config import get_db

            cross_validator = CrossDocumentValidator(get_db())
            anomalies.extend(cross_validator.run(request.extraction))

        normalized_anomalies = dedupe_anomalies(anomalies)
        features = build_features(request.extraction, document, len(normalized_anomalies))
        ml_result = detector.predict(features)

        rules_score = compute_rules_score(normalized_anomalies)
        ml_score = float(ml_result.get("fraud_score") or 0.0)
        fraud_score = round(rules_score * 0.65 + ml_score * 0.35, 3)

        return {
            "fraud_score": fraud_score,
            "anomaly_count": len(normalized_anomalies),
            "anomalies": normalized_anomalies,
            "ml_result": ml_result,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"evaluate_error: {exc}") from exc
