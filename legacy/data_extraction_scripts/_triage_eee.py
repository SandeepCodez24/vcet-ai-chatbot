import fitz
import os

folder = "data/custom_dataset_build/Academics/Departments/EEE/pdfs"
for name in sorted(os.listdir(folder)):
    path = os.path.join(folder, name)
    try:
        doc = fitz.open(path)
        total_chars = sum(len(page.get_text()) for page in doc)
        print(f"{name}: {len(doc)} pages, {total_chars} chars {'[SCANNED/IMAGE-ONLY]' if total_chars < 20 else ''}")
    except Exception as e:
        print(f"{name}: ERROR {e}")
