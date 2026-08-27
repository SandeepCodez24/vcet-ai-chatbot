import fitz, sys

folder = "data/custom_dataset_build/Academics/Departments/IT/pdfs/"
name = sys.argv[1]
maxpages = int(sys.argv[2]) if len(sys.argv) > 2 else 9999
doc = fitz.open(folder + name)
for i, page in enumerate(doc):
    if i >= maxpages:
        break
    print(f"--- page {i+1} ---")
    print(page.get_text())
