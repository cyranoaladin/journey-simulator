---
description: Switches Zyno tone and lexical field between personas.
---

# Persona-Switch Workflow

1.  **Tone Configuration**: Map persona (Hub, Foundry, Architect, Studio, Engine, Master) to specific prompt prefixes in `prompts.js`.
2.  **Lexical Swap**: Inject persona-specific terminology (e.g., "PDA" for Hub, "Bonding Curves" for Foundry).
3.  **Registry Sync**: Ensure `Registry` reflects the active persona's capabilities.
4.  **Validation**: Verify Zyno's response tone matches the user's selected path.
