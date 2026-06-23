import cv2
import os

path = r"c:\Users\valde\amavidas\public\uploads\extracted\page_4.png"
print(f"Exists: {os.path.exists(path)}")
if os.path.exists(path):
    img = cv2.imread(path)
    if img is None:
        print("Failed to load image with OpenCV!")
    else:
        print(f"Image shape: {img.shape}")
        print(f"Unique pixel values: {len(list(set(img.flatten()[:1000])))}")
        # Print a 5x5 subgrid of pixel values from the middle of the image
        h, w, c = img.shape
        print("Middle pixels:")
        print(img[h//2:h//2+5, w//2:w//2+5])
