# Security Vault Global Rule

## Objective
Zero-compromise security posture for Web3 and API interactions.

## Rules
### Zero-Keys-In-Code
- No API keys, private keys, or seed phrases are to be committed or stored in plain text within the codebase.
- Use environment variables or secure vaults.

### Web3-Sentinel Enforcement
- Any blockchain interaction (minting, staking, voting) must be gated by the `Web3-Solana-Sentinel` logic.
- Verify SIWS (Sign-In with Solana) status before any state mutation on-chain.
