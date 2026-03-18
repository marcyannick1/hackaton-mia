from fastapi import FastAPI, File, UploadFile
from pdf2image import convert_from_path
import pytesseract
import tempfile
from extract import determine_document_type
from extract import extract_invoice_data
from extract import extract_siret_attestation_data
from extract import extract_urssaf_data
from extract import extract_kbis_data
from extract import extract_rib_data
from extract import extract_devis_data

app = FastAPI()

@app.get("/")
def test():
    return {"Bienvenue sur l'API OCR"}


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
