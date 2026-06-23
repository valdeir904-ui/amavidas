import fitz  # PyMuPDF
import os

pdf_path = r"c:\Users\valde\amavidas\scratch\fixed.pdf"
output_dir = r"c:\Users\valde\amavidas\public\uploads\extracted"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Total pages: {len(doc)}")

for page_num in range(len(doc)):
    page = doc[page_num]
    # Set matrix for high resolution (e.g. 2.0 zoom factor)
    zoom = 2.0
    mat = fitz.Matrix(zoom, zoom)
    pix = page.get_pixmap(matrix=mat)
    
    output_path = os.path.join(output_dir, f"page_{page_num + 1}.png")
    pix.save(output_path)
    print(f"Saved page {page_num + 1} to {output_path}")

print("Rendering complete.")
