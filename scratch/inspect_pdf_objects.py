import fitz
import os

pdf_path = r"c:\Users\valde\amavidas\GUIA ASSISTENCIAL AMAVIDAS ATUALIZADO (1) (1).pdf"
doc = fitz.open(pdf_path)

for page_num in range(len(doc)):
    page = doc[page_num]
    images = page.get_images(full=True)
    drawings = page.get_drawings()
    text = page.get_text()
    print(f"Page {page_num+1}: images={len(images)}, drawings={len(drawings)}, text_len={len(text)}")
    
    # Check if there is some hidden layer (optional content groups)
    # or if we can extract the images directly using get_images
    if len(images) > 0:
        for i, img in enumerate(images):
            xref = img[0]
            print(f"  Image {i+1}: xref={xref}, width={img[2]}, height={img[3]}, colorspace={img[5]}")
