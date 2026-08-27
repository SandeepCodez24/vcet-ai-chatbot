import fitz, re
from collections import Counter

doc = fitz.open("data/custom_dataset_build/Academics/Departments/IT/pdfs/IT_Publication.pdf")
full_text = "\n".join(page.get_text() for page in doc)

years = re.findall(r"Academic Year (\d{4}-\d{4})", full_text)
print("Academic years found:", years)

authors = re.findall(r"(Dr\.|Mr\.|Mrs\.|Ms\.)\s?([A-Z][A-Za-z.]+(?:\s[A-Z][A-Za-z.]+){0,3})", full_text)
names = [f"{a} {b}".strip() for a, b in authors]
c = Counter(names)
print("\nTop author mentions:")
for name, count in c.most_common(20):
    print(f"  {count}: {name}")

print("\nTotal author-name regex matches:", len(names))
print("Total pages:", len(doc))
