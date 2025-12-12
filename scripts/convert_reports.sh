#!/bin/bash
# Script to convert annual report Word documents to HTML
# Run this after fixing list formatting in the Word documents

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$SCRIPT_DIR/../documentation"
OUTPUT_DIR="$SCRIPT_DIR/../public/content/reports"

echo "Converting annual reports from Word to HTML..."

# Convert each report
for docx in "$DOCS_DIR/Beyond Prediction Annual Report 2021-2022.docx" \
            "$DOCS_DIR/Beyond Prediction Annual Report 2022-2023.docx" \
            "$DOCS_DIR/Beyond Prediction Annual Report 2023-2024.docx"; do
    
    if [ ! -f "$docx" ]; then
        echo "⚠️  Warning: File not found: $docx"
        continue
    fi
    
    # Extract year from filename
    year=$(basename "$docx" | grep -oE "20[0-9]{2}-20[0-9]{2}")
    
    if [ -z "$year" ]; then
        echo "⚠️  Warning: Could not extract year from: $docx"
        continue
    fi
    
    echo "Converting $year..."
    
    # Convert to HTML and extract body content only
    pandoc "$docx" --to html5 --wrap=none 2>&1 > "$OUTPUT_DIR/${year}.html"
    
    if [ $? -eq 0 ]; then
        echo "  ✓ Successfully converted $year"
    else
        echo "  ✗ Error converting $year"
        exit 1
    fi
done

echo ""
echo "✅ Conversion complete!"
echo ""
echo "Fixing list structures..."
npm run fix:report-lists

echo ""
echo "Verifying list conversion..."
grep -c "<ul\|<ol" "$OUTPUT_DIR"/*.html 2>/dev/null | while read line; do
  file=$(echo "$line" | cut -d: -f1)
  count=$(echo "$line" | cut -d: -f2)
  filename=$(basename "$file")
  if [ "$count" -gt 0 ]; then
    echo "  ✓ $filename: $count list(s) found"
  else
    echo "  ⚠️  $filename: No lists found"
  fi
done

