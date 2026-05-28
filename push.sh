#!/bin/bash
MSG="${1:-"chore: auto deploy $(date '+%Y-%m-%d %H:%M')"}"
echo "🚀 Pushing: $MSG"
git add -A
if git diff --cached --quiet; then
  echo "ℹ️ Nothing new — pushing anyway"
else
  git commit -m "$MSG"
fi
git push origin main
echo "✅ Done — watch: github.com → your repo → Actions tab"
