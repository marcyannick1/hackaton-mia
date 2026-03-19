from pathlib import Path
import pickle

import numpy as np
from sklearn.ensemble import IsolationForest

MODEL_PATH = Path(__file__).resolve().parent / "model" / "isolation_forest.pkl"


class AnomalyDetector:

    def __init__(self):
        self.model = None
        if MODEL_PATH.exists():
            self._load()

    def train(self, feature_vectors: list):
        if not feature_vectors:
            raise ValueError("feature_vectors must contain at least one sample")

        X = np.array(feature_vectors, dtype=float)
        self.model = IsolationForest(
            n_estimators=200,
            contamination=0.08,
            random_state=42,
        )
        self.model.fit(X)
        self._save()
        print(f"Model trained on {len(feature_vectors)} documents")

    def predict(self, features: list) -> dict:
        if self.model is None:
            return {"is_anomaly": False, "fraud_score": 0.0, "reason": "model_not_trained"}

        if hasattr(self.model, "n_features_in_") and self.model.n_features_in_ != len(features):
            return {
                "is_anomaly": False,
                "fraud_score": 0.0,
                "reason": (
                    f"feature_size_mismatch: expected {self.model.n_features_in_}, "
                    f"got {len(features)}"
                ),
            }

        X = np.array([features], dtype=float)
        pred = int(self.model.predict(X)[0])
        raw_score = float(self.model.decision_function(X)[0])
        fraud_score = self._normalize(raw_score)

        return {
            "is_anomaly": pred == -1,
            "fraud_score": round(fraud_score, 3),
            "raw_score": round(raw_score, 4),
        }

    def _normalize(self, raw_score: float) -> float:
        # IsolationForest decision_function: lower values are more abnormal.
        score = 1.0 / (1.0 + np.exp(8 * raw_score))
        return max(0.0, min(1.0, float(score)))

    def _save(self):
        MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
        with open(MODEL_PATH, "wb") as file_obj:
            pickle.dump(self.model, file_obj)

    def _load(self):
        with open(MODEL_PATH, "rb") as file_obj:
            self.model = pickle.load(file_obj)
