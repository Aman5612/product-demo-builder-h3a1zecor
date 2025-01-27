#!/bin/bash

# Install project dependencies
pnpm install

# Fetch environment variables and update .env only if successful
echo "Fetching environment variables..."
response=$(curl -s -H "x-api-key: ldbrkfioyfsxvxuf" \
  "https://tools-backend.dev.opengig.work/integrations/env/product-demo-builder-h3a1zecor")

# Check if response contains error
if [[ $response == *"statusCode\":500"* ]] || [[ $response == *"Internal server error"* ]]; then
  echo "Error fetching environment variables. Skipping .env update."
else
  echo "$response" > .env
  echo "Environment variables updated successfully."
fi