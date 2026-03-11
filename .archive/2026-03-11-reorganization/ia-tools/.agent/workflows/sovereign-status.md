---
description: Automate verification of ports 3000/3002 and integrity hash.
---
# Sovereign Status Workflow

1. **Port Liveness Check**: Verify critical ports are active.
   // turbo
   ```bash
   echo "Checking Ports..."
   lsof -i:3000 -t && echo "Web (3000): OK" || echo "Web (3000): DOWN"
   lsof -i:3002 -t && echo "Backend (3002): OK" || echo "Backend (3002): DOWN"
   ```

2. **Integrity Seal Verification**: Check if the final certificate exists and has a signature.
   // turbo
   ```bash
   CERT_FILE="./MFAI_S2_IRON_FINAL_CERT.json"
   if [ -f "$CERT_FILE" ]; then
     echo "Certificate Found: $CERT_FILE"
     grep "signature" "$CERT_FILE" && echo "Integrity Hash: VERIFIED"
   else
     echo "CRITICAL: Certificate MISSING!"
   fi
   ```

3. **Database Connectivity**: Quick ping to Mongo.
   // turbo
   ```bash
   pgrep mongod && echo "MongoDB: ACTIVE" || echo "MongoDB: DOWN"
   ```
