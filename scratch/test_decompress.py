from pypdf import PdfReader
import zlib
import os

pdf_path = r"c:\Users\valde\amavidas\scratch\fixed.pdf"
reader = PdfReader(pdf_path)

page = reader.pages[0]
images = page.images
print(f"Images count: {len(images)}")

for idx, image in enumerate(images):
    # Let's get the raw indirect object and its stream
    # image is an ImageFile object
    print(f"Image {idx}: name={image.name}")
    try:
        # Get raw stream data before pypdf tries to decode it
        # we can access the underlying stream
        stream = image.indirect_reference.get_object()
        print(f"  Keys: {list(stream.keys())}")
        print(f"  Filter: {stream.get('/Filter')}")
        print(f"  Length: {stream.get('/Length')}")
        
        # Try raw decompression using zlib
        raw_data = stream._data
        print(f"  Raw data length: {len(raw_data)}")
        
        # Try decompressing with various wbits
        for wbits in [15, -15, 31, 47]:
            try:
                dec = zlib.decompress(raw_data, wbits)
                print(f"    Success with wbits={wbits}! Decompressed length: {len(dec)}")
                # Save it
                with open(f"scratch/raw_dec_img_{idx}_{wbits}.bin", "wb") as f:
                    f.write(dec)
            except Exception as ex:
                print(f"    Failed wbits={wbits}: {ex}")
    except Exception as e:
        print(f"  Error: {e}")
