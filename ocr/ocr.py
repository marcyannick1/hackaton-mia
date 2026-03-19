from fastapi import FastAPI, File, UploadFile
from doctr.io import DocumentFile
from doctr.models import ocr_predictor
import re
import extract

app = FastAPI()

model = ocr_predictor(pretrained=True, assume_straight_pages=True)

def run_doctr(file_bytes: bytes, content_type: str) -> list[str]:
    if "pdf" in content_type:
        doc = DocumentFile.from_pdf(file_bytes)
    else:
        doc = DocumentFile.from_images(file_bytes)
    result = model(doc)
    pages = []
    for page in result.pages:
        lines = []
        for block in page.blocks:
            for line in block.lines:
                words = " ".join(word.value for word in line.words)
                lines.append(words)
        pages.append("\n".join(lines))
    return pages

def clean(text: str) -> str:
    text = re.sub(r"(\d)\s+(\d)", r"\1\2", text)  # "3 520" → "3520"
    text = re.sub(r"(?<=\d)O(?=\d)", "0", text)   # O → 0 entre chiffres
    text = re.sub(r"(?<=\d)l(?=\d)", "1", text)   # l → 1 entre chiffres
    return text

@app.get("/")
def root():
    return {"message": "API OCR — Doctr"}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        file_bytes = await file.read()
        content_type = file.content_type or ""
        pages = run_doctr(file_bytes, content_type)
        full_text = clean("\n".join(pages))
        doc_type = extract.determine_document_type(full_text)
        extractors = {
            "facture":           extract.extract_invoice_data,
            "devis":             extract.extract_devis_data,
            "kbis":              extract.extract_kbis_data,
            "attestation_siret": extract.extract_siret_attestation_data,
            "urssaf_vigilance":  extract.extract_urssaf_data,
            "rib":               extract.extract_rib_data,
        }
        extracted = extractors.get(doc_type, lambda x: {})(full_text)
        filled = sum(1 for v in extracted.values() if v)
        score = round(filled / len(extracted) * 100) if extracted else 0
        return {
            "type":      doc_type,
            "filename":  file.filename,
            "method":    "doctr",
            "score":     f"{score}%",
            "extracted": extracted,
            "pages":     pages,
            "full_text": full_text[:2000],
        }
    except Exception as e:
        return {"erreur": str(e)}
