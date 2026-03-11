# Compliance Sentinel Global Rule (R1, R3)

## Objective
Enforce strict technical and linguistic standards across the entire MFAI ecosystem.

## Rules
### R1: Linguistic Sovereignty
- **English Only**: Zero tolerance for French comments, variables, or documentation in agent-related files and core logic.
- **Micro-Audit Requirement**: Any file modification must trigger a scan for legacy French strings.

### R3: Architectural Truth
- **State Integrity**: Frontend UI state must be a direct derivative of backend validation.
- **Zero Ghost State**: Never display success messages or UI transitions before the backend confirms `JourneyStepResponse` integrity.
