#!/bin/sh
set -e
npm run migrate
# Loads the starting catalogue into an empty database; a no-op afterwards.
npm run seed
npx next build
exec npx next start -p "${PORT:-3000}"
