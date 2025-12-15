#!/bin/sh

# Change to the correct directory
cd /usr/src/app/apps/blockchain || {
  echo "Error: Failed to change directory to /usr/src/app/apps/blockchain" >&2
  exit 1
}

# Start hardhat node as a background process
pnpm dev &
HARDHAT_PID=$!

# Wait for hardhat node to initialize
echo "Waiting for Hardhat node to start..."
timeout=60
counter=0
while ! curl -s -X POST http://127.0.0.1:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' > /dev/null 2>&1; do
  if [ $counter -ge $timeout ]; then
    echo "Error: Hardhat node failed to start within $timeout seconds"
    kill $HARDHAT_PID 2>/dev/null || true
    exit 1
  fi
  sleep 1
  counter=$((counter + 1))
done

echo "Hardhat node is ready, deploying contracts..."
pnpm deploy

# The hardhat node process never completes
# Waiting prevents the container from pausing
wait $HARDHAT_PID

