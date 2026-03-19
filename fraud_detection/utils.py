from __future__ import annotations

from datetime import datetime
from typing import Any


def parse_date(date_value: Any) -> datetime | None:
    if date_value is None:
        return None

    if isinstance(date_value, datetime):
        return date_value

    raw = str(date_value).strip()
    if not raw:
        return None

    # Handle common ISO format returned by APIs/OCR pipelines.
    iso_candidate = raw.replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(iso_candidate)
        return parsed.replace(tzinfo=None) if parsed.tzinfo else parsed
    except ValueError:
        pass

    formats = [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%d.%m.%Y",
        "%Y-%m-%d %H:%M:%S",
        "%d/%m/%Y %H:%M:%S",
    ]

    for fmt in formats:
        try:
            return datetime.strptime(raw, fmt)
        except ValueError:
            continue

    return None


def is_blank(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str):
        return value.strip() == ""
    return False


def to_float(value: Any) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip().replace(" ", "").replace(",", ".")
    if text == "":
        return None

    try:
        return float(text)
    except ValueError:
        return None


def normalize_siret(value: Any) -> str | None:
    if is_blank(value):
        return None
    digits = "".join(char for char in str(value) if char.isdigit())
    return digits or None


def normalize_tva(value: Any) -> str | None:
    if is_blank(value):
        return None
    cleaned = str(value).upper().replace(" ", "")
    return cleaned or None


def normalize_iban(value: Any) -> str | None:
    if is_blank(value):
        return None
    cleaned = str(value).upper().replace(" ", "")
    return cleaned or None


def normalize_document_type(value: Any) -> str:
    raw = str(value or "").strip().lower()

    aliases = {
        "facture": "invoice",
        "devis": "quote",
        "urssaf_vigilance": "attestation_urssaf",
        "attestation urssaf": "attestation_urssaf",
        "attestation_siret": "attestation_siret",
    }

    return aliases.get(raw, raw)


def get_nested(data: dict, path: str, default: Any = None) -> Any:
    current = data
    for key in path.split("."):
        if not isinstance(current, dict):
            return default
        current = current.get(key)
        if current is None:
            return default
    return current


def first_non_blank(*values: Any, default: Any = None) -> Any:
    for value in values:
        if not is_blank(value):
            return value
    return default


def first_nested(data: dict, paths: list[str], default: Any = None) -> Any:
    for path in paths:
        value = get_nested(data, path)
        if not is_blank(value):
            return value
    return default


def normalize_anomaly(anomaly: dict) -> dict:
    severity = str(anomaly.get("severity") or "warning").lower()
    if severity not in {"info", "warning", "error"}:
        if severity in {"warn", "medium"}:
            severity = "warning"
        elif severity in {"critical", "high"}:
            severity = "error"
        else:
            severity = "warning"

    description = (
        anomaly.get("description")
        or anomaly.get("detail")
        or anomaly.get("message")
        or "Inconsistency detected"
    )

    return {
        "type": str(anomaly.get("type") or "UNKNOWN").upper(),
        "severity": severity,
        "description": str(description),
    }


def dedupe_anomalies(anomalies: list[dict]) -> list[dict]:
    unique = []
    seen = set()

    for anomaly in anomalies:
        normalized = normalize_anomaly(anomaly)
        key = (normalized["type"], normalized["description"])
        if key in seen:
            continue
        seen.add(key)
        unique.append(normalized)

    return unique


def compute_rules_score(anomalies: list[dict]) -> float:
    weights = {"error": 0.35, "warning": 0.20, "info": 0.05}
    raw_score = sum(weights.get(item.get("severity"), 0.1) for item in anomalies)
    return min(raw_score, 1.0)
