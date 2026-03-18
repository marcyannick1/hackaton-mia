from fastapi import FastAPI, File, UploadFile
from pdf2image import convert_from_path
import pytesseract
import tempfile
from typing import Dict
import re

app = FastAPI()

@app.get("/")
def test():
    return {"Bienvenue sur l'API OCR"}

def safe_extract(match):
    if match is None:
        return None
    if hasattr(match, 'group'):
        return match.group(1) if match.group(1) else match.group(0)
    return str(match)


def determine_document_type(ocr_text: str) -> str:
    text_lower = ocr_text.lower()
    if any(rib_word in text_lower for rib_word in ['rib', 'relevé identité', 'titulaire du compte', 'domiciliation']):
        return "rib"
    if any(word in text_lower for word in ['facture', 'invoice']) and \
            any(word in text_lower for word in ['ht', 'ttc', 'tva']):
        return "facture"
    elif any(word in text_lower for word in ['devis', 'quote']):
        return "devis"
    elif 'attestation' in text_lower and 'siret' in text_lower:
        return "attestation_siret"
    elif 'urssaf' in text_lower or 'vigilance' in text_lower:
        return "urssaf_vigilance"
    elif 'kbis' in text_lower or 'registre commerce' in text_lower:
        return "kbis"
    return "inconnu"


def extract_invoice_data(ocr_text: str) -> Dict:
    text = ocr_text.upper()
    return {
        "siret": safe_extract(re.search(r'SIRET\s*[:\s]?\s*(\d[\d\s-]{13}\d)', text)),
        "tva": safe_extract(re.search(r'TVA[:\s]*(\d+(?:,\d+)?%)?', text)),
        "montant_ht": safe_extract(re.search(r'(?:HT|SOUSTOTALS?)[^\d]*(\d+[.,]\d{2})', text)),
        "montant_ttc": safe_extract(re.search(r'(?:TTC|TOTAL)[^\d]*(\d+[.,]\d{2})', text)),
        "date_emission": safe_extract(re.search(r'DATE\s+(?:FACTURE|CRÉATION)[:\s]*(\d{2}[/\s]\d{2}[/\s]\d{4})', text)),
        "date_expiration": safe_extract(re.search(r'(?:EXPIRATION?|VALIDE\s*JUSQU)[^\d]*(\d{2}/\d{2}/\d{4})', text))
    }

def extract_siret_attestation_data(ocr_text: str) -> Dict:
    text = ocr_text.upper()
    return {
        "siret": safe_extract(re.search(r'\b\d{14}\b', text)),
        "denomination": safe_extract(re.search(r'DÉNOMINATION[:\s]*(.+?)(?=\n|$)', text)),
        "siege_social": safe_extract(re.search(r'SIÈGE SOCIAL[:\s]*(.+?)(?=\n|$)', text)),
        "date_delivrance": safe_extract(re.search(r'DELIVRÉ LE[:\s]*(\d{2}/\d{2}/\d{4})', text))
    }

def extract_urssaf_data(ocr_text: str) -> Dict:
    text = ocr_text.upper()
    return {
        "siret": safe_extract(re.search(r'\b\d{14}\b', text)),
        "situation": safe_extract(re.search(r'SITUATION[:\s]*(RÉGULIÈRE|INTERDITE)', text)),
        "date_vigilance": safe_extract(re.search(r'VIGILANCE[:\s]*(\d{2}/\d{2}/\d{4})', text)),
        "date_fin_validite": safe_extract(re.search(r'VALABLE JUSQU\'AU[:\s]*(\d{2}/\d{2}/\d{4})', text))
    }

def extract_kbis_data(ocr_text: str) -> Dict:
    text = ocr_text.upper()
    return {
        "siret": safe_extract(re.search(r'\b\d{14}\b', text)),
        "forme_juridique": safe_extract(re.search(r'FORME JURIDIQUE[:\s]*([^\n]+)', text)),
        "capital": safe_extract(re.search(r'CAPITAL[:\s]*(\d+[.,]?\d*\s*€?)', text)),
        "rcs": safe_extract(re.search(r'RCS[:\s]*([A-Z]+)\s*(\d+)', text))
    }


def extract_rib_data(ocr_text: str) -> Dict:
    text = ocr_text.upper()
    iban_match = safe_extract(re.search(r'IBAN[^\)]*\):\s*([A-Z]{2}\s*\d{2}\s*(?:\d{4}\s*){5}\d{3}\d{3})',text))
    bic_match = safe_extract(re.search(r'BIC[^\)]*\):\s*([A-Z0-9]{8,11})',text))
    titulaire_match = safe_extract(re.search(r'TITULAIRE\s+DU\s+COMPTE\s*[-:]?\s*(.+?)(?=\n|$)', text))
    domiciliation_match = safe_extract(re.search(r'DOMICILIATION[:\s]*(.+?)(?=\n|$)', text))

    return {
        "iban": iban_match,
        "bic": bic_match,
        "titulaire": titulaire_match,
        "domiciliation": domiciliation_match
    }


def extract_devis_data(ocr_text: str) -> Dict:
    text = ocr_text.upper()
    return {
        "siret": safe_extract(re.search(r'\b\d{14}\b', text)),
        "montant_ht": safe_extract(re.search(r'HT[:\s]*(\d+[.,]\d{2})', text)),
        "montant_ttc": safe_extract(re.search(r'TTC[:\s]*(\d+[.,]\d{2})', text)),
        "validite": safe_extract(re.search(r'VALIDITÉ[:\s]*(\d{2}/\d{2}/\d{4})', text))
    }

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(suffix='.pdf') as tmp:
            tmp.write(await file.read())
            tmp.flush()
            texts = [pytesseract.image_to_string(img.convert('L'))
                     for img in convert_from_path(tmp.name)]
        ocr_full = " ".join(texts)
        doc_type = determine_document_type(ocr_full)
        extractors = {
            "facture": extract_invoice_data,
            "devis": extract_devis_data,
            "attestation_siret": extract_siret_attestation_data,
            "urssaf_vigilance": extract_urssaf_data,
            "kbis": extract_kbis_data,
            "rib": extract_rib_data
        }
        extracted = extractors.get(doc_type, lambda x: {})(ocr_full)
        return {
            "type": doc_type,
            "pages": texts,
            "full_text": ocr_full[:2000],
            "extracted": extracted
        }
    except Exception as e:
        return {"Erreur OCR": str(e)}
