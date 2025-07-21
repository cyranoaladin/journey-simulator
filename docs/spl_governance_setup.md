# SPL Governance Setup

This guide explains how to deploy the SPL Governance program on Solana devnet and configure the application to use it.

## 1. Build the program
```bash
# Clone the SPL repository
git clone https://github.com/solana-labs/solana-program-library.git
cd solana-program-library/governance/program
cargo build-bpf
```

## 2. Deploy to devnet
```bash
solana program deploy target/deploy/spl_governance.so
```
Save the resulting program id; it will be referenced by the application.

## 3. Create a realm and proposal
The governance repo provides a CLI to initialise realms and proposals:
```bash
cargo run --bin governance-cli create-realm ...
cargo run --bin governance-cli create-proposal ...
```
Consult the SPL Governance documentation for detailed parameters.

## 4. Configure the simulator
Update the `GOVERNANCE_PROGRAM_ID` constant in `src/utils/blockchain.ts` (or set the `VITE_GOVERNANCE_PROGRAM_ID` environment variable) with the program id from step 2. Each proposal's public key should be passed to the `DAOVoteModal` component when rendered.
