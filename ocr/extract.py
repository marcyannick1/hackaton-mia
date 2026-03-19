import re
from typing import Optional

def find(pattern: str, text: str) -> Optional[str]:
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        value = match.group(1).strip()
        return value if value else None
    return None

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
        # IBAN : "IBAN   FR19649791481749974413362485"
        "iban":         find(r"IBAN\s+([A-Z]{2}[\d\s]{15,32})", text),
        # BIC  : "BIC   AGRIFRPP"
        "bic":          find(r"BIC\s+([A-Z0-9]{8,11})", text),
        # Titulaire : "Titulaire   AUCHAN CARBURANT"
        "titulaire":    find(r"Titulaire\s+(.+?)(?:\n|$)", text),
        # Banque : "Banque   Crédit Agricole"
        "banque":       find(r"Banque\s+(.+?)(?:\n|$)", text),
    }

def extract_siret_attestation_data(text: str) -> dict:
    return {
        # "N° SIRET   37954800100344"  ou  "SIRET   37954800100344"
        "siret":           find(r"N°?\s*SIRET\s+(\d{14})", text) or find(r"\b(\d{14})\b", text),
        # "Raison sociale   AUCHAN CARBURANT"
        "raison_sociale":  find(r"Raison sociale\s+(.+?)(?:\n|$)", text),
        # "Forme juridique   SAS..."
        "forme_juridique": find(r"Forme juridique\s+(.+?)(?:\n|$)", text),
        # "Date de début   14/11/2025"
        "date_debut":      find(r"Date de d[eé]but\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
        # "Date de fin   14/11/2026"
        "date_fin":        find(r"Date de fin\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }

def extract_urssaf_data(text: str) -> dict:
    return {
        # "SIRET   37954800100344"
        "siret":            find(r"SIRET\s+(\d{14})", text) or find(r"\b(\d{14})\b", text),
        # "Raison sociale   AUCHAN CARBURANT"
        "raison_sociale":   find(r"Raison sociale\s+(.+?)(?:\n|$)", text),
        # "Reference attestation   70890936987441"
        "ref_attestation":  find(r"[Rr]ef(?:erence)?\s+attestation\s+(\d+)", text),
        # "Date de début   05/08/2024"
        "date_debut":       find(r"Date de d[eé]but\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
        # "Date de fin   03/02/2025"
        "date_fin":         find(r"Date de fin\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }

def extract_kbis_data(text: str) -> dict:
    return {
        # "SIRET   37954800100344"
        "siret":            find(r"SIRET\s+(\d{14})", text) or find(r"\b(\d{14})\b", text),
        # "Raison sociale   AUCHAN CARBURANT"
        "raison_sociale":   find(r"Raison sociale\s+(.+?)(?:\n|$)", text),
        # "Forme juridique   SAS, société par actions simplifiée"
        "forme_juridique":  find(r"Forme juridique\s+(.+?)(?:\n|$)", text),
        # "Dirigeant principal   Isabelle Raynaud"
        "dirigeant":        find(r"Dirigeant principal\s+(.+?)(?:\n|$)", text),
        # "Date d'immatriculation   16/05/2015"
        "date_immatriculation": find(r"Date d.immatriculation\s+(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }

def extract_invoice_data(text: str) -> dict:
    return {
        # "SIRET : 67200998502051"  ou  en-tête du document
        "siret":          find(r"SIRET\s*[:\-]?\s*(\d{14})", text) or find(r"\b(\d{14})\b", text),
        # "Total HT   11275.00 €"
        "montant_ht":     find(r"Total\s+HT\s+([\d\s]+[.,]\d{2})", text),
        # "Total TTC   13530.00 €"  ou  "Net à payer   13530.00 €"
        "montant_ttc":    find(r"(?:Total\s+TTC|Net\s+[àa]\s+payer)\s+([\d\s]+[.,]\d{2})", text),
        # "Total TVA   2255.00 €"
        "tva":            find(r"Total\s+TVA\s+([\d\s]+[.,]\d{2})", text),
        # "Date   19/03/2026"  (ligne du tableau en-tête de facture)
        "date_emission":  find(r"(?:^|\n)\s*Date\s+([\d]{2}[/\-][\d]{2}[/\-][\d]{4})", text),
        # "Date d'échéance : 19/05/2026"
        "date_echeance":  find(r"Date d.[eé]ch[eé]ance\s*[:\-]?\s*(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }

def extract_devis_data(text: str) -> dict:
    return {
        # "SIRET : 324471052..."
        "siret":         find(r"SIRET\s*[:\-]?\s*(\d{14})", text) or find(r"\b(\d{14})\b", text),
        # "Total HT   1250.00 €"
        "montant_ht":    find(r"Total\s+HT\s+([\d\s]+[.,]\d{2})", text),
        # "Total TTC   1500.00 €"
        "montant_ttc":   find(r"Total\s+TTC\s+([\d\s]+[.,]\d{2})", text),
        # "Total TVA   250.00 €"
        "tva":           find(r"Total\s+TVA\s+([\d\s]+[.,]\d{2})", text),
        # "Date   19/03/2026"
        "date_emission": find(r"(?:^|\n)\s*Date\s+([\d]{2}[/\-][\d]{2}[/\-][\d]{4})", text),
        # "Devis valable jusqu'au : 05/06/2025"
        "validite":      find(r"valable jusqu.au\s*[:\-]?\s*(\d{2}[/\-]\d{2}[/\-]\d{4})", text),
    }
