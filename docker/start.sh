#!/bin/sh
set -e
# The database can take a moment to answer after Docker starts it (or its
# hostname to resolve on a fresh network): retry before giving up.
tries=0
until npm run migrate; do
  tries=$((tries + 1))
  if [ "$tries" -ge 10 ]; then exit 1; fi
  echo "Database not reachable yet, retrying in 3s ($tries/10)..."
  sleep 3
done
# Loads the starting catalogue into an empty database; a no-op afterwards.
npm run seed
npx next build
exec npx next start -p "${PORT:-3000}"
