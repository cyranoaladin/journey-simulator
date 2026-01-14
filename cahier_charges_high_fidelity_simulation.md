<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# 📑 Cahier des Charges : Module "High-Fidelity Simulation" (MVP)

**Projet :** Money Factory AI - Journey Simulator  
**Version :** 1.0 (MVP Demo)  
**Date :** 01 Décembre 2025  
**Priorité :** CRITIQUE (Pour Demo Investor Day)

-----

## 1\. Contexte et Objectifs

L'objectif est d'implémenter une **simulation haute fidélité** de l'activité des agents IA (Zyno) au sein du Journey Simulator. Actuellement, l'interface est fonctionnelle mais manque de "feedback" visuel et de livrables concrets pour convaincre les investisseurs.

**Nous devons implémenter deux mécanismes clés :**

1.  **L'Effet "Neural Swarm" (Transition) :** Une visualisation graphique de l'IA "en train de réfléchir" et de collaborer entre agents avant de produire un résultat.
2.  **Les Artefacts Tangibles (Livrables) :** Des documents HTML riches (Business Model, Tokenomics, Certificats, Plans de Migration) qui s'affichent comme résultat du travail de l'IA.

-----

## 2\. Architecture Technique

### 2.1 Structure des Fichiers

Le projet `journey-simulator` (Vite/React) doit être structuré comme suit pour accueillir les nouveaux assets.

```text
journey_mfai_back_front/journey-simulator/
├── public/
│   └── generated/                  <-- NOUVEAU DOSSIER
│       ├── neural_swarm.html       (Animation Canvas)
│       ├── tokenomics_sim.html     (Artefact Finance)
│       ├── litepaper_sim.html      (Artefact Tech)
│       ├── business_model.html     (Artefact Stratégie)
│       ├── pitch_deck_slide.html   (Artefact Marketing)
│       ├── migration_blueprint.html(Artefact Web2->3)
│       ├── soulbound_cert.html     (Artefact Education)
│       ├── investor_memo.html      (Artefact Investor)
│       └── rwa_property_sim.html   (Artefact RWA)
├── src/
│   ├── components/
│   │   ├── Artifacts/              <-- NOUVEAUX COMPOSANTS
│   │   │   ├── ArtifactCard.tsx    (Carte UI dans le dashboard)
│   │   │   ├── ArtifactModal.tsx   (Visualiseur Iframe)
│   │   │   └── NeuralOverlay.tsx   (Écran de transition)
│   └── data/
│       └── artifacts.json          <-- Base de données Mock
```

-----

## 3\. Spécifications des Données (JSON)

Ce fichier est la "source de vérité" pour le mode démo. Il relie chaque document à un Agent spécifique et à une phase du parcours.

**Fichier à créer :** `src/data/artifacts.json`

```json
[
  {
    "id": "art-001",
    "title": "Business Model Canvas",
    "type": "STRATEGY",
    "agent": { "name": "Growth Agent", "role": "Strategist", "color": "text-blue-400" },
    "fileUrl": "/generated/business_model.html",
    "unlockPhase": 1
  },
  {
    "id": "art-002",
    "title": "Protocol Litepaper v1.0",
    "type": "TECHNICAL",
    "agent": { "name": "Architect Agent", "role": "System Designer", "color": "text-purple-400" },
    "fileUrl": "/generated/litepaper_sim.html",
    "unlockPhase": 2
  },
  {
    "id": "art-003",
    "title": "Tokenomics Architecture",
    "type": "FINANCE",
    "agent": { "name": "CFO Agent", "role": "Financial Architect", "color": "text-green-400" },
    "fileUrl": "/generated/tokenomics_sim.html",
    "unlockPhase": 3
  },
  {
    "id": "art-004",
    "title": "Series A Pitch Deck",
    "type": "FUNDRAISING",
    "agent": { "name": "Marketing Agent", "role": "CMO", "color": "text-pink-400" },
    "fileUrl": "/generated/pitch_deck_slide.html",
    "unlockPhase": 4
  },
  {
    "id": "art-web2-01",
    "title": "SQL to Solana Migration Blueprint",
    "type": "TECHNICAL",
    "agent": { "name": "Architect Agent", "role": "System Designer", "color": "text-blue-400" },
    "fileUrl": "/generated/migration_blueprint.html",
    "unlockPhase": 2
  },
  {
    "id": "art-learn-01",
    "title": "Proof-of-Skill™ Certificate",
    "type": "CERTIFICATE",
    "agent": { "name": "Education Agent", "role": "Mentor", "color": "text-yellow-400" },
    "fileUrl": "/generated/soulbound_cert.html",
    "unlockPhase": 5
  },
  {
    "id": "art-invest-01",
    "title": "Alpha Deal Memo: Nebula DEX",
    "type": "ANALYSIS",
    "agent": { "name": "Analyst Agent", "role": "Researcher", "color": "text-emerald-400" },
    "fileUrl": "/generated/investor_memo.html",
    "unlockPhase": 1
  },
  {
    "id": "art-rwa-01",
    "title": "Real Estate Tokenization Sim",
    "type": "FINANCE",
    "agent": { "name": "RWA Agent", "role": "Asset Manager", "color": "text-orange-400" },
    "fileUrl": "/generated/rwa_property_sim.html",
    "unlockPhase": 2
  }
]
```

-----

## 4\. Intégration des Assets (HTML)

Le développeur doit copier les codes HTML fournis précédemment dans le dossier `/public/generated/`.
*Note : Si un code HTML manque, référez-vous à l'historique de la conversation pour `tokenomics_sim.html`, `neural_swarm.html`, etc.*

-----

## 5\. Composants React & Logique UI

### 5.1 Composant `NeuralOverlay.tsx` (L'Effet Waouh)

Ce composant gère l'affichage de l'animation canvas par-dessus l'interface pendant que l'IA "réfléchit".

```tsx
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isVisible: boolean;
  agentName: string; // ex: "CFO Agent"
  taskName: string;  // ex: "calculating bonding curve..."
}

export const NeuralOverlay: React.FC<Props> = ({ isVisible, agentName, taskName }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm rounded-3xl overflow-hidden"
        >
          {/* Iframe vers le Canvas HTML */}
          <iframe 
            src="/generated/neural_swarm.html" 
            className="w-full h-full absolute inset-0 border-none opacity-80 pointer-events-none"
          />
          
          {/* Texte Informatif au premier plan */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative z-10 text-center space-y-2 mt-32"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm font-mono text-green-400 uppercase tracking-widest">
                Neural Swarm Active
              </span>
            </div>
            <h3 className="text-2xl font-display font-bold text-white">
              {agentName} is working...
            </h3>
            <p className="text-gray-400 font-mono text-sm animate-pulse">
              > {taskName}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### 5.2 Logique d'Intégration (`JourneyWorkspace.tsx`)

C'est ici que réside l'intelligence du mode Démo.

**Logique requise :**

1.  Écouter la complétion d'une étape (`currentStep.status === 'completed'`).
2.  Vérifier si un artefact est mappé à cette étape pour le persona actuel.
3.  Si oui :
      * Activer `NeuralOverlay` (isThinking = true).
      * Attendre 3.5 secondes.
      * Désactiver `NeuralOverlay`.
      * Débloquer l'artefact (update state).
      * Ouvrir automatiquement la modale de l'artefact pour montrer le résultat.

**Snippet d'implémentation :**

```tsx
// Dans src/components/Journey/JourneyWorkspace.tsx

import { NeuralOverlay } from '../Artifacts/NeuralOverlay';
import { ArtifactModal } from '../Artifacts/ArtifactModal';
import artifactsData from '../../data/artifacts.json';
import { toast } from 'sonner'; // Supposant l'usage de sonner ou react-hot-toast

// ... (dans le corps du composant)

const [isThinking, setIsThinking] = useState(false);
const [currentTask, setCurrentTask] = useState({ agent: '', task: '' });
const [viewingArtifact, setViewingArtifact] = useState<any>(null);
const [unlockedArtifacts, setUnlockedArtifacts] = useState<string[]>([]);

// Mapping Demo
const DEMO_SCENARIOS: Record<string, Record<number, string>> = {
  'web2_migrator': { 2: 'art-web2-01' },  // Step 2 -> Migration Blueprint
  'web3_builder':  { 3: 'art-003' },      // Step 3 -> Tokenomics
  'learner':       { 5: 'art-learn-01' }, // Step 5 -> Certificate
  'investor':      { 1: 'art-invest-01' },// Step 1 -> Deal Memo
  'rwa_issuer':    { 2: 'art-rwa-01' }    // Step 2 -> RWA Sim
};

// Effect Trigger
useEffect(() => {
  // Seulement en mode DEMO et si l'étape vient d'être complétée
  if (mode === 'demo' && userProgress.currentStepStatus === 'completed') {
    
    const personaId = selectedPersona?.id || 'web3_builder';
    const currentStepIndex = userProgress.completedPhases.length + 1; // Simplification pour l'exemple
    
    const artifactId = DEMO_SCENARIOS[personaId]?.[currentStepIndex];
    
    if (artifactId && !unlockedArtifacts.includes(artifactId)) {
      const artifact = artifactsData.find(a => a.id === artifactId);
      if (!artifact) return;

      // 1. Démarrer l'animation
      setCurrentTask({ 
        agent: artifact.agent.name, 
        task: `Generating ${artifact.title}...` 
      });
      setIsThinking(true);

      // 2. Timer de simulation (3.5s)
      setTimeout(() => {
        setIsThinking(false);
        setUnlockedArtifacts(prev => [...prev, artifactId]);
        
        // 3. Feedback utilisateur
        toast.success("New Artifact Generated!");
        
        // 4. Ouvrir le résultat
        setViewingArtifact(artifact);
      }, 3500);
    }
  }
}, [userProgress, mode, selectedPersona]);

return (
  <div className="relative h-full w-full">
    {/* Overlay Animation - Toujours au dessus */}
    <NeuralOverlay 
      isVisible={isThinking} 
      agentName={currentTask.agent} 
      taskName={currentTask.task} 
    />

    {/* Modal Viewer */}
    <ArtifactModal 
      isOpen={!!viewingArtifact} 
      onClose={() => setViewingArtifact(null)}
      fileUrl={viewingArtifact?.fileUrl}
      title={viewingArtifact?.title}
    />

    {/* Reste du Workspace (Chat, Sidebar...) */}
    {/* ... */}
  </div>
);
```

-----

## 6\. Design System & UX Guidelines

Pour garantir l'effet "Waouh", le développeur doit respecter ces règles CSS :

1.  **Transparence & Flou :** Toutes les cartes et modales doivent utiliser `backdrop-filter: blur(12px)` avec des bordures semi-transparentes (`border-white/10`).
2.  **Typographie Tech :** Utilisez la font `Space Grotesk` pour tous les titres d'artefacts et les noms d'agents.
3.  **Code Colours :** Respectez le code couleur des agents dans l'UI :
      * Finance/DeFi : Vert `#14F195`
      * Tech/Architecture : Violet `#A020F0`
      * Strategy/Growth : Bleu `#3b82f6`
      * Risk/Legal : Jaune/Rouge
4.  **Transitions :** Aucune apparition brutale. Utilisez `framer-motion` pour des `fadeIn` et `slideUp` doux (duration: 0.4s).

-----

## 7\. Critères d'Acceptation (QA)

Le module sera considéré comme valide si :

  * [ ] Le dossier `/public/generated/` contient les 9 fichiers HTML.
  * [ ] En mode "Demo", compléter l'étape 3 du profil "Builder" déclenche l'animation Swarm.
  * [ ] L'animation Swarm dure entre 3 et 4 secondes et bloque l'interface (overlay).
  * [ ] À la fin de l'animation, la Tokenomics s'ouvre automatiquement.
  * [ ] L'utilisateur peut fermer la modale et la rouvrir depuis une liste d'artefacts débloqués.
  * [ ] Aucun bug d'affichage (Z-index) n'est visible sur l'overlay.
