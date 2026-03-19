FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from doctr.models import ocr_predictor; ocr_predictor(pretrained=True)"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "ocr:app", "--host", "0.0.0.0", "--port", "8000"]