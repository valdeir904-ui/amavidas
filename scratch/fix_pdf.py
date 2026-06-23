from pypdf import PdfReader, PdfWriter
import os

pdf_path = r"c:\Users\valde\amavidas\GUIA ASSISTENCIAL AMAVIDAS ATUALIZADO (1) (1).pdf"
fixed_path = r"c:\Users\valde\amavidas\scratch\fixed.pdf"

try:
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    
    for page in reader.pages:
        writer.add_page(page)
        
    with open(fixed_path, "wb") as f:
        writer.write(f)
    print(f"Successfully wrote fixed PDF to {fixed_path}")
except Exception as e:
    print(f"Error fixing PDF: {e}")
