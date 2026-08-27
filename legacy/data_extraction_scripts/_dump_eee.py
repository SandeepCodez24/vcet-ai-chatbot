import fitz
import sys
import os

folder = "data/custom_dataset_build/Academics/Departments/EEE/pdfs"
name = sys.argv[1]
path = os.path.join(folder, name)
doc = fitz.open(path)
if len(sys.argv) > 2 and sys.argv[2] == "grep":
    kw = sys.argv[3]
    for i, page in enumerate(doc):
        text = page.get_text()
        if kw.upper() in text.upper():
            print(f"--- PAGE {i+1} ---")
            print(text)
else:
    start = int(sys.argv[2]) if len(sys.argv) > 2 else 0
    end = int(sys.argv[3]) if len(sys.argv) > 3 else len(doc)
    for i in range(start, min(end, len(doc))):
        print(f"--- PAGE {i+1} ---")
        print(doc[i].get_text())
