from __future__ import annotations

import csv
import sys
from pathlib import Path

import numpy as np

# Permet d'importer les modules du dossier parent
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from anomaly_detection import AnomalyDetector

# -- Chemins ------------------------------------------------------------------
DATA_PATH = ROOT / "data" / "isolation_forest_training.csv"
MODEL_PATH = ROOT / "model" / "isolation_forest.pkl"

# -- Parametres de generation -------------------------------------------------
N_NORMAL = 900       # documents normaux
N_ANOMALY = 80       # documents anormaux (~8% contamination)
RANDOM_SEED = 42

FEATURE_NAMES = [
    "ht",
    "tva",
    "ttc",
    "tva_ratio",
    "ttc_gap",
    "days_since_issue",
    "days_to_expiry",
    "confidence",
    "anomaly_count",
    "is_high_amount",
    "is_expired",
]

# Taux de TVA légaux français
VALID_TVA_RATES = [0.20, 0.10, 0.055, 0.021, 0.0]
RATE_WEIGHTS    = [0.75, 0.15, 0.05,  0.03,  0.02]


def _make_normal(rng: np.random.Generator) -> list[float]:
    """Document administratif cohérent et valide."""
    ht = float(rng.uniform(200, 50_000))
    rate = rng.choice(VALID_TVA_RATES, p=RATE_WEIGHTS)
    tva = round(ht * rate, 2)
    # Petit écart d'arrondi (±0.01 €) pour simuler la réalité OCR
    ttc = round(ht + tva + rng.uniform(-0.01, 0.01), 2)

    tva_ratio = tva / ht if ht > 0 else 0.0
    ttc_gap = abs((ht + tva) - ttc)

    days_since_issue = float(rng.integers(0, 365))
    days_to_expiry   = float(rng.integers(10, 400))   # attestation valide
    confidence       = float(rng.uniform(75, 100))
    anomaly_count    = float(rng.integers(0, 2))      # 0 ou 1

    return [
        ht, tva, ttc, tva_ratio, ttc_gap,
        days_since_issue, days_to_expiry,
        confidence, anomaly_count,
        float(ht > 100_000),       # is_high_amount
        float(days_to_expiry < 0), # is_expired
    ]


def _make_anomaly(rng: np.random.Generator) -> list[float]:
    """Document frauduleux ou incohérent — 5 profils distincts."""
    profile = rng.integers(0, 5)

    if profile == 0:
        # TVA incohérente (taux hors normes légales)
        ht = float(rng.uniform(500, 30_000))
        bad_rate = rng.choice([0.15, 0.25, 0.30, 0.40])
        tva = round(ht * bad_rate, 2)
        ttc = round(ht + tva, 2)
        tva_ratio = bad_rate
        ttc_gap = 0.0
        days_since_issue = float(rng.integers(0, 300))
        days_to_expiry   = float(rng.integers(10, 300))
        confidence       = float(rng.uniform(70, 100))
        anomaly_count    = float(rng.integers(1, 3))

    elif profile == 1:
        # Attestation expirée
        ht = float(rng.uniform(200, 20_000))
        rate = rng.choice(VALID_TVA_RATES, p=RATE_WEIGHTS)
        tva = round(ht * rate, 2)
        ttc = round(ht + tva, 2)
        tva_ratio = tva / ht if ht > 0 else 0.0
        ttc_gap = 0.0
        days_since_issue = float(rng.integers(30, 600))
        days_to_expiry   = float(rng.integers(-500, -1))  # expiré
        confidence       = float(rng.uniform(70, 100))
        anomaly_count    = float(rng.integers(1, 4))

    elif profile == 2:
        # Montant HT/TTC incohérent (falsification du TTC)
        ht = float(rng.uniform(500, 40_000))
        rate = rng.choice(VALID_TVA_RATES, p=RATE_WEIGHTS)
        tva = round(ht * rate, 2)
        # TTC délibérément faux (écart important)
        ttc = round(ht + tva + rng.uniform(500, 5_000), 2)
        tva_ratio = tva / ht if ht > 0 else 0.0
        ttc_gap = abs((ht + tva) - ttc)
        days_since_issue = float(rng.integers(0, 300))
        days_to_expiry   = float(rng.integers(10, 300))
        confidence       = float(rng.uniform(65, 100))
        anomaly_count    = float(rng.integers(2, 5))

    elif profile == 3:
        # Mauvaise qualité OCR + beaucoup d'anomalies
        ht = float(rng.uniform(100, 10_000))
        rate = rng.choice(VALID_TVA_RATES, p=RATE_WEIGHTS)
        tva = round(ht * rate, 2)
        ttc = round(ht + tva, 2)
        tva_ratio = tva / ht if ht > 0 else 0.0
        ttc_gap = float(rng.uniform(0, 50))
        days_since_issue = float(rng.integers(0, 400))
        days_to_expiry   = float(rng.integers(-100, 300))
        confidence       = float(rng.uniform(20, 60))   # OCR très bas
        anomaly_count    = float(rng.integers(3, 7))

    else:
        # Montant anormalement élevé + SIRET suspect
        ht = float(rng.uniform(100_001, 500_000))
        rate = rng.choice([0.20, 0.10])
        tva = round(ht * rate, 2)
        ttc = round(ht + tva + rng.uniform(-0.01, 0.01), 2)
        tva_ratio = rate
        ttc_gap = abs((ht + tva) - ttc)
        days_since_issue = float(rng.integers(0, 100))
        days_to_expiry   = float(rng.integers(-200, 50))
        confidence       = float(rng.uniform(60, 95))
        anomaly_count    = float(rng.integers(2, 6))

    return [
        ht, tva, ttc, tva_ratio, ttc_gap,
        days_since_issue, days_to_expiry,
        confidence, anomaly_count,
        float(ht > 100_000),
        float(days_to_expiry < 0),
    ]


def generate_dataset(rng: np.random.Generator) -> tuple[list[list[float]], list[int]]:
    samples = []
    labels  = []  # 0 = normal, 1 = anomalie (pour le CSV uniquement)

    for _ in range(N_NORMAL):
        samples.append(_make_normal(rng))
        labels.append(0)

    for _ in range(N_ANOMALY):
        samples.append(_make_anomaly(rng))
        labels.append(1)

    # Mélange aléatoire
    indices = list(range(len(samples)))
    rng.shuffle(indices)
    samples = [samples[i] for i in indices]
    labels  = [labels[i]  for i in indices]

    return samples, labels


def save_csv(samples: list[list[float]], labels: list[int]):
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(DATA_PATH, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(FEATURE_NAMES + ["label"])
        for row, label in zip(samples, labels):
            writer.writerow([round(v, 4) for v in row] + [label])
    print(f"Dataset sauvegardé -> {DATA_PATH}  ({len(samples)} lignes)")


def main():
    rng = np.random.default_rng(RANDOM_SEED)

    print("Génération des données synthétiques...")
    samples, labels = generate_dataset(rng)
    save_csv(samples, labels)

    print("Entraînement du modèle IsolationForest...")
    detector = AnomalyDetector()
    detector.train(samples)

    print(f"Modèle sauvegardé -> {MODEL_PATH}")
    print()
    
    print("-- Vérification rapide --------------------------------------")
    normal_sample  = _make_normal(rng)
    anomaly_sample = _make_anomaly(rng)

    r_normal  = detector.predict(normal_sample)
    r_anomaly = detector.predict(anomaly_sample)

    print(f"Document normal  -> is_anomaly={r_normal['is_anomaly']},  fraud_score={r_normal['fraud_score']}")
    print(f"Document anormal -> is_anomaly={r_anomaly['is_anomaly']}, fraud_score={r_anomaly['fraud_score']}")
    print("-------------------------------------------------------------")


if __name__ == "__main__":
    main()
