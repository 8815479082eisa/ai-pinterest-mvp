#!/usr/bin/env bash
# Uploads all images in r2-images/ to the Cloudflare R2 bucket.
# Requires: `npx wrangler login` beforehand (opens the browser, no keys in the terminal).
set -euo pipefail

BUCKET="${R2_BUCKET:-ai-pinterest-images}"
cd "$(dirname "$0")/../r2-images"

for file in */*.jpg; do
  echo "↑ $file"
  npx --yes wrangler r2 object put "$BUCKET/$file" \
    --file "$file" \
    --content-type image/jpeg \
    --cache-control "public, max-age=31536000, immutable" \
    --remote
done

echo "Fertig: $(ls */*.jpg | wc -l) Bilder in $BUCKET"
