#!/usr/bin/env bash
# Creates the public R2 bucket (if needed) and uploads all images in r2-images/.
# Requires: `npx wrangler login` beforehand (opens the browser, no keys in the terminal).
set -euo pipefail

BUCKET="${R2_BUCKET:-ai-pinterest-images}"
cd "$(dirname "$0")/../r2-images"

npx --yes wrangler r2 bucket create "$BUCKET" || echo "Bucket existiert bereits – weiter."
npx --yes wrangler r2 bucket dev-url enable "$BUCKET" --force

for file in */*.jpg; do
  echo "↑ $file"
  npx --yes wrangler r2 object put "$BUCKET/$file" \
    --file "$file" \
    --content-type image/jpeg \
    --cache-control "public, max-age=31536000, immutable" \
    --remote
done

echo "Fertig: $(ls */*.jpg | wc -l) Bilder in $BUCKET"
echo "Deine öffentliche Bild-URL (→ IMAGE_BASE_URL):"
npx --yes wrangler r2 bucket dev-url get "$BUCKET"
