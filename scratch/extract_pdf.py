import fitz  # PyMuPDF
import os
import re

pdf_path = r"c:\Users\valde\amavidas\GUIA ASSISTENCIAL AMAVIDAS ATUALIZADO (1) (1).pdf"
output_dir = r"c:\Users\valde\amavidas\public\uploads\extracted"
os.makedirs(output_dir, exist_ok=True)

doc = fitz.open(pdf_path)
print(f"Number of pages: {len(doc)}")

# We will save extracted text to a text file for review
text_output_path = r"c:\Users\valde\amavidas\scratch\extracted_text.txt"
all_text = []

for page_num in range(len(doc)):
    page = doc[page_num]
    text = page.get_text()
    all_text.append(f"--- PAGE {page_num + 1} ---\n{text}\n")
    
    # Extract images
    image_list = page.get_images(full=True)
    print(f"Page {page_num + 1} has {len(image_list)} images")
    
    for img_idx, img in enumerate(image_list):
        xref = img[0]
        base_image = doc.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        
        image_name = f"page_{page_num + 1}_img_{img_idx + 1}.{image_ext}"
        image_path = os.path.join(output_dir, image_name)
        
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        print(f"  Saved image: {image_name}")

with open(text_output_path, "w", encoding="utf-8") as f:
    f.writelines(all_text)

print(f"Text extraction completed. Saved to {text_output_path}")
