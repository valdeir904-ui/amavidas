import os

conversation_dir = r"C:\Users\valde\.gemini\antigravity-ide\brain\10e0fdc2-f3b3-4cef-9b4c-644b4b2c6604"

for root, dirs, files in os.walk(conversation_dir):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
            full_path = os.path.join(root, file)
            size = os.path.getsize(full_path)
            print(f"Found image: {full_path} (size: {size} bytes)")
