#!/bin/bash
# IndexNow ping script for carshake.online
# Usage: bash scripts/indexnow-ping.sh

API_KEY="c03ed1532b4f4e1c9a5f8d7e6b2a1c0d"
HOST="carshake.online"
ENDPOINT="https://api.indexnow.org/indexnow"

# URLs from sitemap — subset for initial ping
URLS=(
  "https://carshake.online/"
  "https://carshake.online/free/instant-proof"
  "https://carshake.online/faq"
  "https://carshake.online/city/new-york"
  "https://carshake.online/city/los-angeles"
  "https://carshake.online/city/miami"
  "https://carshake.online/city/chicago"
  "https://carshake.online/city/san-francisco"
  "https://carshake.online/city/las-vegas"
  "https://carshake.online/city/washington-dc"
  "https://carshake.online/city/boston"
  "https://carshake.online/city/dallas"
  "https://carshake.online/city/houston"
  "https://carshake.online/city/atlanta"
  "https://carshake.online/city/seattle"
  "https://carshake.online/city/phoenix"
  "https://carshake.online/city/san-diego"
  "https://carshake.online/city/denver"
  "https://carshake.online/city/orlando"
  "https://carshake.online/city/new-orleans"
  "https://carshake.online/city/nashville"
  "https://carshake.online/city/austin"
  "https://carshake.online/city/philadelphia"
  "https://carshake.online/llms-full.txt"
)

# Build JSON payload
PAYLOAD=$(printf '%s\n' "${URLS[@]}" | jq -R -s -c '{host: "'$HOST'", key: "'$API_KEY'", keyLocation: "https://'$HOST'/'$API_KEY'.txt", urlList: split("\n") | map(select(length > 0))}')

echo "Pinging IndexNow with $(echo "$PAYLOAD" | jq '.urlList | length') URLs..."

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "Response: HTTP $HTTP_CODE"
echo "$BODY"
