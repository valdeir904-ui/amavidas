from PIL import Image
import os

extracted_dir = r"c:\Users\valde\amavidas\public\uploads\extracted"
for i in range(1, 7):
    path = os.path.join(extracted_dir, f"page_{i}.png")
    if os.path.exists(path):
        img = Image.open(path)
        print(f"page_{i}.png: size={img.size}")
