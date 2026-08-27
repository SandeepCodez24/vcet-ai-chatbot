import fitz, sys

d = r"data/custom_dataset_build/Academics/Departments/MBA/pdfs/"
files = ["ACMS_2023-2024.pdf","ACMS_2024-2025.pdf","ACMS_2025-2026.pdf",
         "CA1_2023-2024.pdf","CA1_2024-2025.pdf","CA_2023-2024.pdf","CA_2024-2025.pdf",
         "EO_2023-2024.pdf","EO_2024-2025.pdf","EO_2025-2026.pdf",
         "MBA_Consultancy.pdf","MBA_MoU.pdf","MBA_Patent.pdf","MBA_Publication.pdf",
         "PLA_2024-2025.pdf","TLP.pdf"]
for f in files:
    doc = fitz.open(d+f)
    print(f"\n===== {f} =====")
    for i,page in enumerate(doc):
        print(f"--page {i+1}--")
        print(page.get_text())
