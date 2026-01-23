<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# 🏭 Cahier des Charges : Scénarios de Démo & Artefacts par Parcours

## 1\. Vue d'ensemble des Scénarios (Demo Mode)

L'objectif est de scripter l'expérience utilisateur. Lorsque le développeur active le mode `DEMO` (`const [mode, setMode] = useState<'demo'|'prod'>('demo')`), le système doit simuler une réflexion de l'IA et faire apparaître les artefacts suivants aux étapes clés.

| ID Parcours | Persona | Scénario Démo | Artefact Clé (Le "Wow") | Trigger (Moment d'apparition) |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Web2 Migrator** | E-commerce souhaitant lancer un programme de fidélité on-chain. | **Technical Migration Blueprint** (Schéma DB SQL → Solana Accounts) | Après l'étape "Audit Technique" |
| **P2** | **Web3 Builder** | (Déjà fait : Solaris DePIN) | **Tokenomics & Litepaper** | Après l'étape "Architecture" |
| **P3** | **Learner** | Étudiant apprenant Rust/Solana. | **Soulbound Certificate (SBT)** (Visuel du NFT de compétence) | Après l'étape "Quiz Final" |
| **P4** | **Investor** | VC cherchant des pépites. | **Due Diligence Report** (Analyse de risque & Scoring) | Après l'étape "Deal Flow Review" |
| **P5** | **RWA Issuer** | Propriétaire immobilier voulant tokeniser un immeuble. | **Property Tokenization Sim** (Calculs financiers & Tranches) | Après l'étape "Valuation" |

-----

## 2\. Codes HTML des Nouveaux Artefacts

Le développeur doit sauvegarder ces fichiers dans `public/generated/`.

### A. Parcours Web2 Migrator : `migration_blueprint.html`

*Un document technique montrant comment Zyno transforme une base de données Web2 en architecture Solana.*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Web2 to Solana Migration Blueprint</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { background: #0A0A1F; color: #E0E0E0; font-family: 'Inter', sans-serif; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        .arrow-right { position: relative; }
        .arrow-right::after { content: '→'; position: absolute; right: -20px; top: 50%; transform: translateY(-50%); color: #A020F0; font-weight: bold; }
        .glass-panel { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); }
    </style>
</head>
<body class="p-8 h-screen flex flex-col">
    <header class="mb-8 border-b border-white/10 pb-4">
        <div class="flex items-center gap-2 text-blue-400 mb-2 font-mono text-xs">
            <i data-lucide="database" class="w-4 h-4"></i> ARCHITECT AGENT // MIGRATION PLAN
        </div>
        <h1 class="text-3xl font-bold text-white font-[Space_Grotesk]">Legacy SQL to Solana Program Mapping</h1>
        <p class="text-gray-400 mt-1">Loyalty Points System Migration Strategy</p>
    </header>

    <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-12 items-center justify-center">
        <div class="glass-panel p-6 rounded-xl relative border-l-4 border-gray-500">
            <div class="absolute -top-3 left-4 bg-gray-700 text-white text-xs px-2 py-1 rounded">CURRENT STATE (PostgreSQL)</div>
            <div class="space-y-4 font-mono text-sm">
                <div class="p-3 bg-black/40 rounded border border-gray-700">
                    <span class="text-blue-400">TABLE</span> users {<br>
                    &nbsp;&nbsp;id: UUID (PK)<br>
                    &nbsp;&nbsp;email: VARCHAR<br>
                    &nbsp;&nbsp;points_balance: INT<br>
                    }
                </div>
                <div class="flex justify-center text-gray-500 text-xs">⛔ Centralized Ledger</div>
                <div class="flex justify-center text-gray-500 text-xs">⛔ Non-interoperable</div>
            </div>
            <div class="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_#A020F0]">
                    <i data-lucide="arrow-right" class="text-white w-5 h-5"></i>
                </div>
            </div>
        </div>

        <div class="glass-panel p-6 rounded-xl border-l-4 border-green-400 relative">
            <div class="absolute -top-3 left-4 bg-green-900 text-green-100 text-xs px-2 py-1 rounded">TARGET STATE (Solana PDA)</div>
            <div class="space-y-4 font-mono text-sm">
                <div class="p-3 bg-green-900/10 rounded border border-green-500/30">
                    <span class="text-purple-400">STRUCT</span> UserLoyaltyAccount {<br>
                    &nbsp;&nbsp;authority: Pubkey,<br>
                    &nbsp;&nbsp;mint: Pubkey ($LOYAL),<br>
                    &nbsp;&nbsp;amount: u64,<br>
                    &nbsp;&nbsp;bump: u8<br>
                    }
                </div>
                <div class="flex justify-center text-green-400 text-xs">✅ Compressed NFTs for Tiers</div>
                <div class="flex justify-center text-green-400 text-xs">✅ Tradeable on DEX</div>
            </div>
        </div>
    </div>

    <div class="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h3 class="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
            <i data-lucide="code-2" class="w-4 h-4"></i> Zyno Implementation Plan
        </h3>
        <p class="text-xs text-gray-300">
            Zyno will deploy a <strong>Anchor Program</strong> utilizing Metaplex for asset issuance. User emails will be mapped to generated non-custodial wallets via Web3Auth integration, ensuring seamless UX for existing customers.
        </p>
    </div>

    <script>lucide.createIcons();</script>
</body>
</html>
```

### B. Parcours Learner : `soulbound_certificate.html`

*Un certificat visuellement impressionnant prouvant la compétence acquise.*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Proof of Skill NFT</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;600&display=swap" rel="stylesheet">
    <style>
        body { background: #000; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .nft-card {
            width: 380px; height: 550px;
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border-radius: 20px;
            border: 1px solid rgba(255,215,0,0.3);
            box-shadow: 0 0 40px rgba(160, 32, 240, 0.3);
            position: relative; overflow: hidden;
            display: flex; flex-direction: column;
        }
        .holo-overlay {
            position: absolute; inset: 0;
            background: linear-gradient(125deg, transparent 30%, rgba(255,255,255,0.1) 40%, transparent 50%);
            animation: shine 4s infinite linear;
        }
        @keyframes shine { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .seal {
            width: 120px; height: 120px; margin: 40px auto 20px;
            background: url('https://upload.wikimedia.org/wikipedia/commons/3/3b/Solana_logo.png') no-repeat center/contain; /* Placeholder for Solana Logo */
            filter: drop-shadow(0 0 10px #A020F0);
        }
    </style>
</head>
<body>
    <div class="nft-card">
        <div class="holo-overlay"></div>
        <div class="p-6 text-center text-white z-10 h-full flex flex-col">
            <div class="text-xs uppercase tracking-[0.3em] text-yellow-500 mb-8">Money Factory AI</div>
            
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10v6M12 2v20M12 12H2M12 12h10M12 12l-5-5M12 12l5-5M12 12l-5 5M12 12l5 5"/></svg>
            </div>

            <h1 class="font-[Cinzel] text-2xl font-bold mb-2">Solana Architect</h1>
            <div class="text-sm text-purple-300 mb-8">Level 1 Certification</div>

            <div class="mt-auto border-t border-white/10 pt-4 text-left">
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                    <span>MINT ID</span>
                    <span class="font-mono text-white">#882910</span>
                </div>
                <div class="flex justify-between text-xs text-gray-400 mb-1">
                    <span>TYPE</span>
                    <span class="font-mono text-yellow-400">SOULBOUND (Non-Transferable)</span>
                </div>
                <div class="flex justify-between text-xs text-gray-400">
                    <span>ISSUER</span>
                    <span class="font-mono text-white">Zyno Authority</span>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

### C. Parcours Investor : `investor_deal_memo.html`

*Une analyse "Deep Dive" financière sur un projet.*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Investment Memo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>body { background: #0A0A1F; color: #fff; font-family: 'Inter', sans-serif; }</style>
</head>
<body class="p-8">
    <div class="max-w-4xl mx-auto border border-white/10 rounded-xl bg-[#13132B] overflow-hidden">
        <div class="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-6 border-b border-white/10 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold">Project Alpha: "Nebula DEX"</h1>
                <div class="text-sm text-green-400 font-mono mt-1">CONFIDENTIAL // DEAL ROOM ACCESS</div>
            </div>
            <div class="text-right">
                <div class="text-3xl font-bold text-white">92/100</div>
                <div class="text-xs text-gray-400 uppercase">MFAI Score</div>
            </div>
        </div>

        <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 class="text-gray-400 uppercase text-xs font-bold tracking-wider mb-4">Risk Analysis (Automated)</h3>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>Team Vesting</span>
                            <span class="text-green-400">Low Risk</span>
                        </div>
                        <div class="h-1 bg-gray-700 rounded"><div class="h-1 bg-green-400 rounded" style="width: 90%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>Liquidity Depth</span>
                            <span class="text-yellow-400">Medium Risk</span>
                        </div>
                        <div class="h-1 bg-gray-700 rounded"><div class="h-1 bg-yellow-400 rounded" style="width: 60%"></div></div>
                    </div>
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span>Code Audit (Zyno)</span>
                            <span class="text-green-400">Secure</span>
                        </div>
                        <div class="h-1 bg-gray-700 rounded"><div class="h-1 bg-green-400 rounded" style="width: 98%"></div></div>
                    </div>
                </div>
            </div>

            <div class="bg-white/5 rounded-lg p-5">
                <h3 class="text-gray-400 uppercase text-xs font-bold tracking-wider mb-4">Deal Terms</h3>
                <ul class="space-y-3 text-sm">
                    <li class="flex justify-between border-b border-white/5 pb-2">
                        <span class="text-gray-400">Valuation (FDV)</span>
                        <span class="font-mono text-white">$12,000,000</span>
                    </li>
                    <li class="flex justify-between border-b border-white/5 pb-2">
                        <span class="text-gray-400">Allocation</span>
                        <span class="font-mono text-white">$250k (MFAI Exclusive)</span>
                    </li>
                    <li class="flex justify-between border-b border-white/5 pb-2">
                        <span class="text-gray-400">Lock-up</span>
                        <span class="font-mono text-white">6m Cliff, 18m Vesting</span>
                    </li>
                </ul>
                <button class="w-full mt-4 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition">
                    Commit USDC
                </button>
            </div>
        </div>
    </div>
    <script>lucide.createIcons();</script>
</body>
</html>
```

### D. Parcours RWA : `rwa_property_sim.html`

*Simulation de tokenisation immobilière.*

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>RWA Simulation</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>body { background: #0A0A1F; color: #fff; font-family: 'Inter', sans-serif; }</style>
</head>
<body class="p-8">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <div>
            <div class="relative rounded-2xl overflow-hidden mb-6 border border-white/10">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" alt="Building" class="w-full h-64 object-cover opacity-80">
                <div class="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent p-6">
                    <h2 class="text-2xl font-bold">Skyline Tower Block A</h2>
                    <p class="text-gray-300 flex items-center gap-2">📍 Dubai Marina, UAE</p>
                </div>
                <div class="absolute top-4 right-4 bg-green-500 text-black text-xs font-bold px-3 py-1 rounded-full">
                    SPV READY
                </div>
            </div>
        </div>

        <div class="space-y-6">
            <div class="bg-[#13132B] p-6 rounded-xl border border-white/10">
                <h3 class="text-purple-400 uppercase text-xs font-bold mb-4">Financial Structure</h3>
                <div class="grid grid-cols-2 gap-4 text-center">
                    <div class="bg-black/30 p-3 rounded">
                        <div class="text-gray-400 text-xs">Asset Value</div>
                        <div class="text-xl font-mono font-bold">$4,500,000</div>
                    </div>
                    <div class="bg-black/30 p-3 rounded">
                        <div class="text-gray-400 text-xs">Token Price</div>
                        <div class="text-xl font-mono font-bold">$50.00</div>
                    </div>
                    <div class="bg-black/30 p-3 rounded">
                        <div class="text-gray-400 text-xs">Est. APY</div>
                        <div class="text-xl font-mono font-bold text-green-400">8.5%</div>
                    </div>
                    <div class="bg-black/30 p-3 rounded">
                        <div class="text-gray-400 text-xs">Total Tokens</div>
                        <div class="text-xl font-mono font-bold">90,000</div>
                    </div>
                </div>
            </div>
            
            <div class="bg-[#13132B] p-6 rounded-xl border border-white/10">
                <h3 class="text-blue-400 uppercase text-xs font-bold mb-2">Legal Wrapper</h3>
                <p class="text-sm text-gray-400 mb-4">Zyno has generated the SPV documents in Delaware compliant with Reg D.</p>
                <div class="flex gap-2">
                    <button class="flex-1 bg-white/5 hover:bg-white/10 border border-white/20 py-2 rounded text-sm transition">View Operating Agreement</button>
                    <button class="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-sm transition">Mint Tokens</button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

-----

## 3\. Mise à jour des Données : `src/data/artifacts.json`

Ajoutez ces entrées au fichier JSON existant pour couvrir tous les cas.

```json
[
  // ... (Garder les artefacts existants du Web3 Builder)

  {
    "id": "art-web2-01",
    "title": "SQL to Solana Migration Plan",
    "type": "TECHNICAL",
    "agent": { "name": "Architect Agent", "role": "System Designer", "color": "text-blue-400" },
    "description": "Blueprint complet pour migrer les données utilisateurs vers des PDAs Solana.",
    "fileUrl": "/generated/migration_blueprint.html",
    "thumbnailIcon": "database",
    "status": "locked",
    "unlockPhase": 2
  },
  {
    "id": "art-learn-01",
    "title": "Proof-of-Skill™ Certificate",
    "type": "CERTIFICATE",
    "agent": { "name": "Education Agent", "role": "Mentor", "color": "text-yellow-400" },
    "description": "Certificat Soulbound NFT vérifiable sur la blockchain.",
    "fileUrl": "/generated/soulbound_certificate.html",
    "thumbnailIcon": "award",
    "status": "locked",
    "unlockPhase": 3
  },
  {
    "id": "art-invest-01",
    "title": "Alpha Deal Memo: Nebula DEX",
    "type": "ANALYSIS",
    "agent": { "name": "Analyst Agent", "role": "Researcher", "color": "text-emerald-400" },
    "description": "Rapport de due diligence avec scoring de risque algorithmique.",
    "fileUrl": "/generated/investor_deal_memo.html",
    "thumbnailIcon": "file-bar-chart",
    "status": "locked",
    "unlockPhase": 1
  },
  {
    "id": "art-rwa-01",
    "title": "Real Estate Tokenization Sim",
    "type": "FINANCE",
    "agent": { "name": "RWA Agent", "role": "Asset Manager", "color": "text-orange-400" },
    "description": "Simulation financière pour l'actif 'Skyline Tower'.",
    "fileUrl": "/generated/rwa_property_sim.html",
    "thumbnailIcon": "building",
    "status": "locked",
    "unlockPhase": 2
  }
]
```

-----

## 4\. Instructions d'Intégration pour le Développeur

Demandez au développeur d'intégrer la logique suivante dans le composant `JourneyWorkspace` ou le gestionnaire d'état (`store`).

### A. Logique de Déclenchement (Demo Trigger)

```typescript
// Dans JourneyWorkspace.tsx

// 1. Détecter le changement d'étape (step completion)
useEffect(() => {
  if (mode === 'demo' && currentStep.status === 'completed') {
    
    // Identifier l'artefact à débloquer selon le Persona et l'étape
    const artifactToUnlock = findArtifactForStep(selectedPersona.id, currentStep.id);
    
    if (artifactToUnlock) {
      // 2. Simuler un délai de "Génération par l'Agent" (3 secondes)
      setIsAgentThinking(true);
      
      setTimeout(() => {
        setIsAgentThinking(false);
        
        // 3. Débloquer l'artefact (Mise à jour du state)
        unlockArtifact(artifactToUnlock.id);
        
        // 4. Notification "Toast"
        toast.success(`Agent ${artifactToUnlock.agent.name} generated: ${artifactToUnlock.title}`, {
          icon: artifactToUnlock.agent.avatar
        });
        
      }, 3000);
    }
  }
}, [currentStep.status, mode]);

// Helper function (Logique métier simplifiée pour la démo)
const findArtifactForStep = (personaId: string, stepIndex: number) => {
  // Mapping durci pour la démo
  const demoMapping = {
    'web2_migrator': { 2: 'art-web2-01' }, // Step 2 unlock migration plan
    'web3_builder': { 3: 'art-003' },      // Step 3 unlock tokenomics
    'learner': { 5: 'art-learn-01' },      // Step 5 unlock cert
    'investor': { 1: 'art-invest-01' },    // Step 1 unlock memo
    'rwa_issuer': { 2: 'art-rwa-01' }      // Step 2 unlock property sim
  };
  
  const artifactId = demoMapping[personaId]?.[stepIndex];
  if (!artifactId) return null;
  
  return artifactsData.find(a => a.id === artifactId);
};
```

### B. Validation UI

  * Assurez-vous que le composant `ArtifactCard` affiche une animation (ex: `framer-motion` scale up) lorsqu'il passe de `locked` à `unlocked`.
  * Ajoutez un son subtil (bip technologique) lors de l'apparition de l'artefact pour renforcer l'immersion.

-----

**Résumé pour le Développeur :**

1.  **Copiez/Collez** les 4 fichiers HTML dans `public/generated/`.
2.  **Mettez à jour** `artifacts.json` avec les nouvelles données.
3.  **Implémentez** le `useEffect` ci-dessus dans le Workspace pour automatiser l'apparition des documents au moment où l'utilisateur termine une étape en mode démo.
