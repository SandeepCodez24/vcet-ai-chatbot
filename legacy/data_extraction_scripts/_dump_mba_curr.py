import fitz, re, sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r"data/custom_dataset_build/Academics/Departments/MBA/pdfs/PGMBA-2023.pdf")
for i in range(4, 9):
    t = doc[i].get_text()
    print(f"--page {i+1}--")
    print(t[:2200])
    print()
