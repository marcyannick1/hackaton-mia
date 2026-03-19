# OCR

## Setup Instructions

1. **Install Required Python Packages:**
    - `faker`: For generating fake data.
    - `fpdf`: For creating PDF files.
    - `pdf2image`: For converting PDFs to images.
    - `pytesseract`: For performing OCR.

    Install these packages using pip:
    ```
    pip install faker fpdf pdf2image pytesseract
    ```

2. **Install Tesseract:**
    - Tesseract must be installed on your host machine. Refer to [Tesseract documentation](https://github.com/tesseract-ocr/tesseract) for installation instructions.

## Usage

- **Extracting Text from Invoices:**
  - Place your invoice PDFs in the `/docs` directory.
  - Rename them as `invoice{nb}.pdf` (e.g., `invoice1.pdf`, `invoice2.pdf`, ...).
  - Run `ocr_test.py` to extract text from these invoices.

## Project Structure

- `/docs`: Directory for invoice PDFs and extracted text.
- `ocr_test.py`: Script for OCR on real invoices.