---
name: Persistence-Guard
description: Handles database synchronization and environment isolation.
---

# Persistence-Guard Skill

## Competencies
- **MongoDB Sync**: Ensures data consistency between the backend services and the database.
- **Idempotency Mastery**: Manages idempotency keys to prevent duplicate transactions or state updates.
- **Isolation Logic**: Strictly enforces `appMode: 'demo' | 'real'` boundaries to prevent test data from polluting production-ready structures.

## Application
- Use to debug data loss or synchronization issues in the journey persistence layer.
