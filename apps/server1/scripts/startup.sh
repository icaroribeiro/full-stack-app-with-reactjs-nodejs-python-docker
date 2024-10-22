#! /bin/bash

node ./scripts/migrate.mjs -- --dir=./db/migrations
vite-node ./dist/index.js
