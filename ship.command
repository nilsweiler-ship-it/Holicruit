#!/bin/zsh
# Double-click in Finder (or run in Terminal) to commit everything and push.
# The commit message comes from .commitmsg if present, else a timestamp.
cd "$(dirname "$0")" || exit 1
set -e
git pull --rebase --autostash origin main
if [ -s .commitmsg ]; then
  msg="$(cat .commitmsg)"
else
  msg="Update $(date '+%Y-%m-%d %H:%M')"
fi
git add -A
if git diff --cached --quiet; then
  echo "Nothing to commit."
else
  git commit -m "$msg"
fi
git push origin main
rm -f .commitmsg
echo
echo "Pushed. CI: https://github.com/nilsweiler-ship-it/Holicruit/actions"
echo "(This window can be closed.)"
