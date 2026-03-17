from pdf2image import convert_from_path
import pytesseract
import os

def  convert_pdf_to_image(pdf_path):
    images = convert_from_path(pdf_path)
    return images

def test_ocr():
    pdf_files = [f for f in os.listdir("./docs") if f.endswith(".pdf")]
    num_files = len(pdf_files)

    for i in range(1, num_files + 1):
        pdf_path = f"./docs/invoice{i}.pdf"
        images = convert_pdf_to_image(pdf_path)
        for image in images:
            output_folder = f"./docs/invoice{i}"
            os.makedirs(output_folder, exist_ok=True)
            gray_image = image.convert('L')
            gray_image.save(f"./docs/invoice{i}/gray.png")
            text = pytesseract.image_to_string(gray_image)
            with open(f"./docs/invoice{i}/text.txt", "w") as text_file:
                text_file.write(text)
            print(f"Texte extrait du document {i} :\n{text}\n{'-'*40}")
        

if __name__ == "__main__":
    test_ocr()