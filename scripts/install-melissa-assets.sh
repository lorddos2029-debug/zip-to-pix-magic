#!/usr/bin/env bash
set -euo pipefail

# Fotografias originais publicadas pela família no site melissadelua.com.br.
# Executar na raiz do projeto antes do build de produção.
mkdir -p public/melissa

download() {
  local url="$1"
  local target="$2"
  local temp="${target}.download"
  curl --fail --location --retry 3 --connect-timeout 20 --max-time 120 \
    --user-agent "Mozilla/5.0" \
    --referer "https://melissadelua.com.br/" \
    --output "$temp" "$url"
  test -s "$temp"
  mv "$temp" "$target"
  echo "Salvo: $target"
}

download "https://melissadelua.com.br/wp-content/uploads/2026/06/IMG_9110_Original-scaled.jpeg" "public/melissa/melissa-hero.jpeg"
download "https://melissadelua.com.br/wp-content/uploads/2026/06/Melissa-1024x512.png" "public/melissa/melissa-banner.png"

echo "Imagens da campanha Melissa prontas para o build."
