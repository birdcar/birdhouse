#!/usr/bin/env bash

bun build src/index.ts --cwd="${GITHUB_ACTION_PATH:=$PWD}" --compile --outfile=dist/bh
