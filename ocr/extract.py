import re
from typing import Optional, Tuple


def find(pattern: str, text: str) -> Optional[str]:
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        value = match.group(1).strip()
        return value if value else None
    return None


def extract_totaux(text: str) -> Tuple[Optional[str], Optional[str], Optional[str]]:
    bloc = re.search(r"Total\s+HT(.*)", text, re.DOTALL | re.IGNORECASE)
    if not bloc:
        return None, None, None
    montants = re.findall(r'(?<!\d)(\d{1,7}[.,]\d{2})(?=\s|€|\n|$)', bloc.group(1))
    return (montants[0] if len(montants) > 0 else None,
            montants[1] if len(montants) > 1 else None,
            montants[2] if len(montants) > 2 else None)


def determine_document_type(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["iban", "bic", "titulaire"]):
        return "rib"
    if "urssaf" in t or ("vigilance" in t and "siret" in t):
        return "urssaf_vigilance"
    if "attestation" in t and "siret" in t:
        return "attestation_siret"
    if "kbis" in t or "extrait kbis" in t or "registre" in t and "commerce" in t:
        return "kbis"
    if any(w in t for w in ["facture", "invoice"]) and any(w in t for w in ["ttc", "tva"]):
        return "facture"
    if "devis" in t or "quote" in t:
        return "devis"
    return "inconnu"


def extract_rib_data(text: str) -> dict:
    return {
        "iban":      find(r"IBAN\s+([A-Z]{2}[\d\s]{15,32})", text),
        "bic":       find(r"BIC\s+([A-Z0-9]{8,11})", text),
        "titulaire": find(r"Titulaire\s+(.+?)(?:\n|$)", text),
        "banque":    find(r"Banque\s+(.+?)(?:\n|$)", text),
    }


def extract_siret_attestation_data(text: str) -> dict:
    return {
        "siret":           find(r"N°?\s*SIRET\s+(\d{14})", text) or find(r"\b(\d{14})\b", text),
        "raison_sociale":  find(r"Raison sociale\s+(.+?)(?:\n|$)", text),
        "forme_juridique": find(r"Forme juridique\s+(.+?)(?:\n|$)", text),
        "date_debut":      find(r"Date de d[eé]but\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
        "date_fin":        find(r"Date de fin\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }


def extract_urssaf_data(text: str) -> dict:
    return {
        "siret":           find(r"SIRET\s+(\d{14})", text) or find(r"\b(\d{14})\b", text),
        "raison_sociale":  find(r"Raison sociale\s+(.+?)(?:\n|$)", text),
        "ref_attestation": find(r"[Rr]ef(?:erence)?\s+attestation\s+(\d+)", text),
        "date_debut":      find(r"Date de d[eé]but\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
        "date_fin":        find(r"Date de fin\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }


def extract_kbis_data(text: str) -> dict:
    return {
        "siret":                find(r"SIRET\s+(\d{14})", text) or find(r"\b(\d{14})\b", text),
        "raison_sociale":       find(r"Raison sociale\s+(.+?)(?:\n|$)", text),
        "forme_juridique":      find(r"Forme juridique\s+(.+?)(?:\n|$)", text),
        "dirigeant":            find(r"Dirigeant principal\s+(.+?)(?:\n|$)", text),
        "date_immatriculation": find(r"Date d.immatriculation\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }


def extract_invoice_data(text: str) -> dict:
    ht, tva, ttc = extract_totaux(text)
    return {
        "siret":         find(r"SIRET\s*[:\-\s]+\s*(\d{14})", text) or find(r"\b(\d{14})\b", text),
        "montant_ht":    ht,
        "montant_ttc":   find(r"Net\s+[àa]\s+payer\s*\n?\s*(\d{1,7}[.,]\d{2})", text) or ttc,
        "tva":           tva,
        "date_emission": find(r"(?:FA|DV)-\d+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
        "date_echeance": find(r"Date d.[eé]ch[eé]ance\s*[:\-]?\s*(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }


def extract_devis_data(text: str) -> dict:
    ht, tva, ttc = extract_totaux(text)
    return {
        "siret":         find(r"SIRET\s*[:\-\s]+\s*(\d{14})", text) or find(r"\b(\d{14})\b", text),
        "montant_ht":    ht,
        "montant_ttc":   ttc,
        "tva":           tva,
        "date_emission": find(r"(?:FA|DV)-\d+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
        "validite":      find(r"valable jusqu.au\s*[:\-]?\s*(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }
