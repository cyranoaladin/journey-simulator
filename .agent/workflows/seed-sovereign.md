---
description: Seed the database and establish 'Veteran' state for testing.
---
# Seed Sovereign Workflow

1. Ensure MongoDB is running.
   // turbo
   ```bash
   pgrep mongod || echo "MongoDB not running! Start it first."
   ```

2. Seed the database with the Demo User.
   > [!NOTE]
   > Using `seed-test-user.js` as the primary seeder.
   
   // turbo
   ```bash
   node mf-back/scripts/seed-test-user.js
   ```

3. Confirm Veteran Status.
   - Login with the seeded credentials.
   - Verify the "Veteran" badge is visible in the profile or store state.
