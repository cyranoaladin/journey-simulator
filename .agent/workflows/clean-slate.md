---
description: Resolve system blocks by killing processes and clearing caches.
---
# Clean Slate Protocol

1. **Terminate Zombie Processes**: Free up ports 3000, 3001, 3002.
   // turbo
   ```bash
   lsof -t -i:3000 | xargs -r kill -9
   lsof -t -i:3001 | xargs -r kill -9
   lsof -t -i:3002 | xargs -r kill -9
   echo "Ports Liberated."
   ```

2. **Purge Caches**: Remove temporary build artifacts.
   // turbo
   ```bash
   rm -rf .next .cache node_modules/.cache
   echo "Cache Purged."
   ```

3. **Re-index Context**: Verify the library is intact.
   // turbo
   ```bash
   ls -R .context/
   echo "Context Re-indexed."
   ```

4. **Announce Status**:
   // turbo
   ```bash
   echo "SYSTEM_RECALIBRATED"
   ```
