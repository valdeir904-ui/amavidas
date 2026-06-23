import cv2
import numpy as np
import os

extracted_dir = r"c:\Users\valde\amavidas\public\uploads\extracted"
output_dir = r"c:\Users\valde\amavidas\public\uploads\parceiros"
os.makedirs(output_dir, exist_ok=True)

# Let's write a function to detect cards on a page
def detect_and_crop_cards(page_num):
    image_path = os.path.join(extracted_dir, f"page_{page_num}.png")
    if not os.path.exists(image_path):
        print(f"File not found: {image_path}")
        return
    
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Threshold to get binary image
    # The background is white (255), borders are grey/dark
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    
    # Find contours
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    cards = []
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        # Filter by width and height of a typical card
        # On a page of 1163x1304, a card is in one of the columns.
        # Column width is ~580. A card is around 400-500px wide, and 80-200px high.
        if 250 <= w <= 550 and 50 <= h <= 250:
            cards.append((x, y, w, h))
            
    # Sort cards: first by column (left vs right), then by y coordinate
    # Left column: x < 581. Right column: x >= 581
    left_cards = [c for c in cards if c[0] < 581]
    right_cards = [c for c in cards if c[0] >= 581]
    
    left_cards.sort(key=lambda c: c[1])
    right_cards.sort(key=lambda c: c[1])
    
    sorted_cards = []
    # We alternate or just group them? Usually, it's read top-down in the left column, then top-down in the right column.
    # So we'll process left column first, then right column.
    sorted_cards.extend(left_cards)
    sorted_cards.extend(right_cards)
    
    print(f"Page {page_num}: Detected {len(sorted_cards)} cards. (Left: {len(left_cards)}, Right: {len(right_cards)})")
    
    # Save a diagnostic image showing the detected cards
    diag_img = img.copy()
    for idx, (x, y, w, h) in enumerate(sorted_cards):
        # Draw green bounding box for card
        cv2.rectangle(diag_img, (x, y), (x + w, y + h), (0, 255, 0), 2)
        # Draw red bounding box for estimated logo region (left 35% of the card)
        logo_w = int(w * 0.38)
        cv2.rectangle(diag_img, (x, y), (x + logo_w, y + h), (0, 0, 255), 2)
        # Draw card index text
        cv2.putText(diag_img, str(idx + 1), (x + 10, y + 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 0), 2)
        
    diag_path = os.path.join(extracted_dir, f"page_{page_num}_diag.png")
    cv2.imwrite(diag_path, diag_img)
    print(f"  Saved diagnostic image to {diag_path}")
    
    # Crop and save cards and logos
    for idx, (x, y, w, h) in enumerate(sorted_cards):
        # Crop full card
        card_crop = img[y:y+h, x:x+w]
        card_name = f"page_{page_num}_card_{idx + 1}.png"
        cv2.imwrite(os.path.join(output_dir, card_name), card_crop)
        
        # Crop logo region (left 38% of the card, slightly padded inside)
        logo_w = int(w * 0.38)
        # We can add a small padding to avoid the card border
        pad = 3
        logo_crop = img[y+pad:y+h-pad, x+pad:x+logo_w-pad]
        logo_name = f"page_{page_num}_logo_{idx + 1}.png"
        cv2.imwrite(os.path.join(output_dir, logo_name), logo_crop)

for p in [4, 5, 6]:
    detect_and_crop_cards(p)
