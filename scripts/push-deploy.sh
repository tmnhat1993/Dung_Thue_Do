#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

REMOTE="$(git remote get-url origin)"
SITE="$(mktemp -d)"
trap 'rm -rf "$SITE"' EXIT

cp index.html "$SITE/"
touch "$SITE/.nojekyll"
if [[ -f README.md ]]; then cp README.md "$SITE/"; fi
if [[ -f HUONG_DAN.md ]]; then cp HUONG_DAN.md "$SITE/"; fi

cd "$SITE"
git init -b deploy
git add -A
git commit -m "Deploy static site $(date -u +%Y-%m-%dT%H:%MZ)"
git remote add origin "$REMOTE"
git push -u origin deploy --force

echo "Pushed branch deploy → origin."
echo "GitHub Pages: https://tmnhat1993.github.io/Dung_Thue_Do/"
