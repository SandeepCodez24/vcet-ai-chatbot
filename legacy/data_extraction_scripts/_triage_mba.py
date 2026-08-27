import fitz, os

d = r"data/custom_dataset_build/Academics/Departments/MBA/pdfs"
for f in sorted(os.listdir(d)):
    if not f.endswith(".pdf"):
        continue
    path = os.path.join(d, f)
    try:
        doc = fitz.open(path)
        text_len = sum(len(page.get_text()) for page in doc)
        print(f"{f}\tpages={doc.page_count}\ttext_len={text_len}")
    except Exception as e:
        print(f"{f}\tERROR: {e}")
