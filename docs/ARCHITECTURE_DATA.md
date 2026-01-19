<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->


## User Identity and Ownership

| System | Role | Identity Key | Constraints |
| :--- | :--- | :--- | :--- |
| **`web` (Prisma)** | **Source of Truth** | `Wallet.address` | Unique per wallet. Controls billing & access. |
| **`mf-back` (Mongo)** | Execution Context | `User.wallet_address` | Unique index. Mirrors identity for runtime. |

**Contract**:
-   A user must be identified by their **Wallet Address** (canonical, base58).
-   `mf-back` should not create users without a valid wallet address.
-   Future migration: Link `mf-back` User to `web` User via `portalUserId`.

## Journey Ownership

| System | Role | Representation | Notes |
| :--- | :--- | :--- | :--- |
| **`web` (Prisma)** | Product Definition | `Journey` table | Tracks entitlement (e.g. bought "Founder Journey"). |
| **`mf-back` (Mongo)** | Execution Instance | `Journey` document | Tracks detailed state (steps, variables, agent runs). |

**Contract**:
-   `mf-back` owns the **state machine** (steps, progress).
-   `web` owns the **access rights** (payment, gating).
-   Linkage: `Journey.user_wallet` matches `User.wallet_address`.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
