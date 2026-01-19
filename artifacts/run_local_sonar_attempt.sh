#!/bin/bash
# Wrapper to start local SonarQube and run scan (Option B from User Request)
set -e

# Config
SONAR_HOST_URL="http://localhost:9000"
SONAR_LOGIN="admin"
SONAR_PASSWORD="admin" # Default
OUT="artifacts/proof/lead12_sonar"
mkdir -p "$OUT"

echo "Checking for local SonarQube..."
if ! docker ps | grep -q "sonarqube"; then
  echo "Starting SonarQube container..."
  # Start SQ in background
  docker run -d --name sonarqube -p 9000:9000 sonarqube:community
  echo "Waiting for SonarQube to be up (this may take a while)..."
  # Wait loop
  for i in {1..60}; do
    if curl -s "$SONAR_HOST_URL/api/system/status" | grep -q '"status":"UP"'; then
      echo "SonarQube is UP!"
      break
    fi
    echo -n "."
    sleep 5
  done
else
  echo "SonarQube container already running."
fi

# Attempt to generate a token (requires curl + jq + basic auth)
# Assuming clean instance with default admin/admin
# Note: Newer SQ versions force password change. This automation is fragile without pre-config.
# If this fails, we ask User to provide token.

echo "Attempting scan with CLI..."
# We use the CLI docker image to scan, connecting to the local host network
# Using host.docker.internal or --network host to reach localhost:9000

# Try scanning - if token missing, it might fail or work if anonymous allowed (rare now)
# User instruction: "Générer un token" -> implies manual step or robust API call.
# I will output the command to run manually if auth fails.

docker run --rm \
    --network host \
    -e SONAR_HOST_URL="$SONAR_HOST_URL" \
    -e SONAR_LOGIN="$SONAR_LOGIN" \
    -e SONAR_PASSWORD="$SONAR_PASSWORD" \
    -v "$PWD:/usr/src" \
    sonarsource/sonar-scanner-cli \
    -Dsonar.projectKey=money-factory-ai \
    -Dsonar.sources=. \
    -Dsonar.host.url="http://127.0.0.1:9000" \
    2>&1 | tee "$OUT/sonar_scan.log" || {
      echo "Scan failed. Manual token generation might be required."
      echo "Please log in to http://localhost:9000 (admin/admin), generate a token, and run:"
      echo "docker run --rm --network host -v \"\$PWD:/usr/src\" -e SONAR_TOKEN=<TOKEN> sonarsource/sonar-scanner-cli -Dsonar.projectKey=mfai -Dsonar.sources=."
    }

# Pack artifacts if log exists
if [ -s "$OUT/sonar_scan.log" ]; then
    grep "QUALITY GATE" "$OUT/sonar_scan.log" > "$OUT/sonar_keylines.txt" || echo "QUALITY GATE NOT FOUND" > "$OUT/sonar_keylines.txt"
    (cd "$OUT" && sha256sum * > sha256.txt)
fi
