import fitz, os, sys

folder = "data/custom_dataset_build/Academics/Departments/IT/pdfs"
for name in sorted(os.listdir(folder)):
    if not name.lower().endswith(".pdf"):
        continue
    path = os.path.join(folder, name)
    size = os.path.getsize(path)
    if size > 20_000_000:
        print(f"{name}: SKIP (size={size})")
        continue
    try:
        doc = fitz.open(path)
        total_text = sum(len(page.get_text()) for page in doc)
        print(f"{name}: pages={len(doc)} textlen={total_text} {'SCANNED' if total_text < 50 else 'OK'}")
    except Exception as e:
        print(f"{name}: ERROR {e}")
