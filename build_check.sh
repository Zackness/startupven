#!/bin/bash
exec > /home/zackness/unexpo-comedor/build_log.txt 2>&1

echo "Starting build_check.sh with FNM"
export PATH="/home/zackness/.local/share/fnm:$PATH"
eval "$(fnm env --shell bash)"

cd /home/zackness/unexpo-comedor
fnm use default

echo "Running tsc..."
npx tsc --noEmit
echo "TSC finished with code $?"
