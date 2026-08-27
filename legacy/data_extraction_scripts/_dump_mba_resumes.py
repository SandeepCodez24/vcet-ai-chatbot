import fitz, os, sys
sys.stdout.reconfigure(encoding='utf-8')
d = r"data/custom_dataset_build/Staffs_details/MBA"
for f in sorted(os.listdir(d)):
    if not f.lower().endswith(".pdf"):
        continue
    doc = fitz.open(os.path.join(d, f))
    print(f"\n===== {f} ({doc.page_count} pages) =====")
    for i in range(min(2, doc.page_count)):
        print(doc[i].get_text()[:1500])
