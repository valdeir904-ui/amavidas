import cv2
import numpy as np
import os

extracted_dir = r"c:\Users\valde\amavidas\public\uploads\extracted"
output_dir = r"c:\Users\valde\amavidas\public\uploads\parceiros"
os.makedirs(output_dir, exist_ok=True)

def test_canny(page_num):
    image_path = os.path.join(extracted_dir, f"page_{page_num}.png")
    if not os.path.exists(image_path):
        return
    
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # Canny edge detection
    edged = cv2.Canny(blurred, 30, 150)
    
    # Find contours
    contours, _ = cv2.findContours(edged.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    print(f"Total contours found on page {page_num}: {len(contours)}")
    
    cards = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # Check coordinates and size
        if 200 <= w <= 550 and 40 <= h <= 280:
            cards.append((x, y, w, h))
            
    print(f"Filtered card-like contours on page {page_num}: {len(cards)}")
    
    # Save diagnostic
    diag_img = img.copy()
    for idx, (x, y, w, h) in enumerate(cards):
        cv2.rectangle(diag_img, (x, y), (x + w, y + h), (0, 255, 0), 2)
    cv2.imwrite(os.path.join(extracted_dir, f"page_{page_num}_canny_diag.png"), diag_img)

for p in [4, 5, 6]:
    test_canny(p)
