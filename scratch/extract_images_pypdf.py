from pypdf import PdfReader
import os

pdf_path = r"c:\Users\valde\amavidas\scratch\fixed.pdf"
output_dir = r"c:\Users\valde\amavidas\public\uploads\extracted_pypdf"
os.makedirs(output_dir, exist_ok=True)

reader = PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

for page_idx, page in enumerate(reader.pages):
    print(f"Page {page_idx + 1}:")
    images = page.images
    print(f"  Found {len(images)} images")
    for img_idx, image in enumerate(images):
        name = f"page_{page_idx + 1}_img_{img_idx + 1}_{image.name}"
        path = os.path.join(output_dir, name)
        with open(path, "wb") as f:
            f.write(image.data)
        print(f"  Saved image: {name}")
