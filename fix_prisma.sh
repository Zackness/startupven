#!/bin/bash
exec > /home/zackness/unexpo-comedor/fix_log.txt 2>&1

echo "Starting fix_prisma.sh with FNM"
export PATH="/home/zackness/.local/share/fnm:$PATH"
eval "$(fnm env --shell bash)"

cd /home/zackness/unexpo-comedor

echo "FNM List:"
fnm list

# Try to determine a node version
# Check if there is a .nvmrc or .node-version (I didn't see one, but maybe hidden differently?)
if [ -f ".nvmrc" ]; then
    fnm use
elif [ -f ".node-version" ]; then
    fnm use
else
    # Try default
    echo "Trying fnm use default"
    fnm use default
fi

if ! command -v node &> /dev/null; then
    echo "Node not found in path. Trying explicit versions..."
    fnm use 22 || fnm use 20 || fnm use 18 || fnm use system
fi

echo "Node: $(which node)"
echo "Version: $(node -v)"
echo "Npx: $(which npx)"

if command -v npx &> /dev/null; then
    npx prisma generate
    npx prisma db push
else
    echo "CRITICAL: npx/node still not found!"
    exit 1
fi
