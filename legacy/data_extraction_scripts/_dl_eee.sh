#!/bin/bash
set -e
BASE="https://vcet.ac.in/vcetit"
OUT="data/custom_dataset_build/Academics/Departments/EEE/pdfs"

declare -A files=(
  ["EEE-2021_curriculum.pdf"]="pdfs/Academics/Departments/Curriculum/EEE-2021.pdf"
  ["EEE-2025_curriculum.pdf"]="pdfs/Academics/Departments/Curriculum/EEE-2025.pdf"
  ["PGEEE-2021_curriculum.pdf"]="pdfs/Academics/Departments/Curriculum/PGEEE-2021.pdf"
  ["TLP.pdf"]="pdfs/Academics/Departments/EEE/TLP.pdf"
  ["EEE_Publication.pdf"]="pdfs/Research/Publications/2025-2026/EEE_Publication.pdf"
  ["EEE_FRP.pdf"]="pdfs/Research/Funded%20Research%20Projects/2025-2026/EEE_FRP.pdf"
  ["EEE_Patent.pdf"]="pdfs/Research/Patents/2025-2026/EEE_Patent.pdf"
  ["EEE_Consultancy.pdf"]="pdfs/Research/Consultancy/2025-2026/EEE_Consultancy.pdf"
  ["EEE_MoU.pdf"]="pdfs/Research/MoUs/2025-2026/EEE_MoU.pdf"
  ["CA_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/CA%202024-2025.pdf"
  ["PS_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/PS%202024-2025.pdf"
  ["EO_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/EO%202024-2025.pdf"
  ["EO_2023-2024.pdf"]="pdfs/Academics/Departments/EEE/EO%202023-2024.pdf"
  ["EO_2022-2023.pdf"]="pdfs/Academics/Departments/EEE/EO%202022-2023.pdf"
  ["EMAG1_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/EMAG1%202024-2025.pdf"
  ["EMAG2_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/EMAG2%202024-2025.pdf"
  ["EMAG1_2023-2024.pdf"]="pdfs/Academics/Departments/EEE/EMAG1%202023-2024.pdf"
  ["EMAG2_2023-2024.pdf"]="pdfs/Academics/Departments/EEE/EMAG2%202023-2024.pdf"
  ["EMAG1_2022-2023.pdf"]="pdfs/Academics/Departments/EEE/EMAG1%202022-2023.pdf"
  ["EMAG2_2022-2023.pdf"]="pdfs/Academics/Departments/EEE/EMAG2%202022-2023.pdf"
  ["EMAG1_2021-2022.pdf"]="pdfs/Academics/Departments/EEE/EMAG1%202021-2022.pdf"
  ["EMAG2_2021-2022.pdf"]="pdfs/Academics/Departments/EEE/EMAG2%202021-2022.pdf"
  ["ACMS_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/ACMS%202024-2025.pdf"
  ["ACMS_2023-2024.pdf"]="pdfs/Academics/Departments/EEE/ACMS%202023-2024.pdf"
  ["ACMS_2022-2023.pdf"]="pdfs/Academics/Departments/EEE/ACMS%202022-2023.pdf"
  ["PLA_2024-2025.pdf"]="pdfs/Academics/Departments/EEE/PLA%202024-2025.pdf"
)

for name in "${!files[@]}"; do
  url="$BASE/${files[$name]}"
  echo "Downloading $name from $url"
  curl -s -o "$OUT/$name" "$url" || echo "FAILED: $name"
done
echo "Done."
