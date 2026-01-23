<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

Cahier des Charges : Module "High-Fidelity Artifacts" (MVP)
1. Contexte et Objectif
L'objectif est de démontrer la valeur ajoutée de la plateforme : la production de livrables concrets (Artifacts). Au lieu de simples réponses textuelles, l'utilisateur recevra des documents interactifs (HTML) simulés, produits par les agents spécialisés (CFO, Architect, Growth, Marketing).

L'expérience utilisateur cible :

L'utilisateur discute avec Zyno dans le Terminal.

Une étape est franchie (ex: "Validation du Business Model").

Une notification apparaît : "Growth Agent a généré un nouvel artefact".

L'utilisateur ouvre le document dans une modale immersive sans quitter l'application.

2. Architecture des Fichiers & Données
A. Structure des Dossiers
Les fichiers HTML générés (Tokenomics, Litepaper, etc.) doivent être placés dans le dossier public pour être accessibles via iframe.

Plaintext

journey-simulator/
├── public/
│   └── generated/
│       ├── tokenomics_sim.html   (Code fourni précédemment)
│       ├── litepaper_sim.html    (Code fourni précédemment)
│       ├── business_model.html   (Code fourni précédemment)
│       └── pitch_deck_slide.html (Code fourni précédemment)
├── src/
│   ├── components/
│   │   ├── Artifacts/
│   │   │   ├── ArtifactCard.tsx
│   │   │   ├── ArtifactModal.tsx
│   │   │   └── ArtifactsList.tsx
│   └── data/
│       └── artifacts.json
B. Structure de Données (JSON)
Ce fichier servira de base de données fictive pour le MVP. Il relie l'agent, le fichier HTML et l'état d'avancement.

Fichier : src/data/artifacts.json

JSON

[
  {
    "id": "art-001",
    "title": "Business Model Canvas",
    "type": "STRATEGY",
    "agent": { "name": "Growth Agent", "role": "Strategist", "color": "text-blue-400" },
    "description": "Analyse complète des flux de revenus et partenaires clés pour Solaris DePIN.",
    "fileUrl": "/generated/business_model.html",
    "thumbnailIcon": "bar-chart-3",
    "status": "unlocked",
    "unlockPhase": 1
  },
  {
    "id": "art-002",
    "title": "Architecture Litepaper",
    "type": "TECHNICAL",
    "agent": { "name": "Architect Agent", "role": "System Designer", "color": "text-purple-400" },
    "description": "Spécifications techniques du protocole Proof-of-Generation sur Solana.",
    "fileUrl": "/generated/litepaper_sim.html",
    "thumbnailIcon": "file-code",
    "status": "locked",
    "unlockPhase": 2
  },
  {
    "id": "art-003",
    "title": "Tokenomics Model",
    "type": "FINANCE",
    "agent": { "name": "CFO Agent", "role": "Financial Architect", "color": "text-green-400" },
    "description": "Modèle de bonding curve, vesting schedule et distribution initiale.",
    "fileUrl": "/generated/tokenomics_sim.html",
    "thumbnailIcon": "pie-chart",
    "status": "locked",
    "unlockPhase": 3
  },
  {
    "id": "art-004",
    "title": "Investorp Pitch Deck",
    "type": "FUNDRAISING",
    "agent": { "name": "Marketing Agent", "role": "CMO", "color": "text-pink-400" },
    "description": "Slide d'impact Series A pour présentation investisseurs.",
    "fileUrl": "/generated/pitch_deck_slide.html",
    "thumbnailIcon": "presentation",
    "status": "locked",
    "unlockPhase": 4
  }
]
3. Composants UI/UX (React + Tailwind)
Nous allons créer trois composants pour une intégration fluide. Assurez-vous d'avoir lucide-react et framer-motion installés.

Composant 1 : ArtifactModal.tsx
Ce composant gère l'affichage du fichier HTML en plein écran via une iframe, avec un style "Glassmorphism" soigné.

TypeScript

import React from 'react';
import { X, Download, ExternalLink, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export const ArtifactModal: React.FC<ArtifactModalProps> = ({ isOpen, onClose, fileUrl, title }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="w-full h-full max-w-7xl max-h-[90vh] bg-[#0A0A1F] border border-purple-500/30 rounded-2xl flex flex-col shadow-2xl overflow-hidden relative"
        >
          {/* Header */}
          <div className="h-14 border-b border-white/10 flex items-center justify-between px-6 bg-[#13132B]">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <h3 className="font-display font-bold text-white tracking-wide">{title}</h3>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-gray-400 hover:text-white transition-colors" title="Simuler Téléchargement">
                <Download size={18} />
              </button>
              <button className="text-gray-400 hover:text-white transition-colors">
                <Share2 size={18} />
              </button>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <button onClick={onClose} className="text-white hover:text-red-400 transition-colors bg-white/5 p-2 rounded-lg">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Iframe Viewer */}
          <div className="flex-1 bg-black relative">
            <iframe 
              src={fileUrl} 
              className="w-full h-full border-none"
              title="Artifact Viewer"
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
Composant 2 : ArtifactCard.tsx
La "carte" qui apparaît dans le dashboard ou la sidebar. Elle montre qui a créé le document et son état.

TypeScript

import React from 'react';
import { FileText, Lock, Eye } from 'lucide-react';

interface Artifact {
  id: string;
  title: string;
  type: string;
  agent: { name: string; role: string; color: string };
  status: string;
  thumbnailIcon: string;
}

interface Props {
  artifact: Artifact;
  onClick: () => void;
}

export const ArtifactCard: React.FC<Props> = ({ artifact, onClick }) => {
  const isLocked = artifact.status === 'locked';

  return (
    <div 
      onClick={!isLocked ? onClick : undefined}
      className={`relative group p-4 rounded-xl border transition-all duration-300 ${
        isLocked 
          ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60' 
          : 'bg-[#13132B]/80 border-purple-500/20 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(160,32,240,0.2)] cursor-pointer backdrop-blur-md'
      }`}
    >
      {/* Badge Type */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
          {artifact.type}
        </span>
        {isLocked && <Lock size={14} className="text-gray-500" />}
      </div>

      {/* Title & Agent */}
      <h4 className="text-white font-bold mb-1 truncate">{artifact.title}</h4>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <span className={artifact.agent.color}>●</span>
        <span>{artifact.agent.name}</span>
      </div>

      {/* Action Area */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500 font-mono">v1.0.0</span>
        {!isLocked && (
          <div className="flex items-center gap-1 text-xs text-purple-400 font-bold group-hover:text-purple-300">
            <Eye size={12} /> View
          </div>
        )}
      </div>
    </div>
  );
};
Composant 3 : ProjectAssets.tsx (Intégration Dashboard)
Ce composant liste tous les artefacts disponibles.

TypeScript

import React, { useState } from 'react';
import { ArtifactCard } from './ArtifactCard';
import { ArtifactModal } from './ArtifactModal';
import artifactsData from '../../data/artifacts.json'; // Import du JSON

export const ProjectAssets = () => {
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);

  // Simulation: On débloque les artefacts selon une logique (ici tous débloqués pour la démo ou filtrés)
  // Pour le MVP, on peut laisser le JSON gérer l'état 'locked'/'unlocked'
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-white">Project Artifacts</h2>
        <span className="text-xs text-purple-400 border border-purple-500/30 px-2 py-1 rounded bg-purple-500/10">
          Generated by Zyno
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {artifactsData.map((art) => (
          <ArtifactCard 
            key={art.id} 
            artifact={art} 
            onClick={() => setSelectedArtifact(art)} 
          />
        ))}
      </div>

      <ArtifactModal 
        isOpen={!!selectedArtifact} 
        onClose={() => setSelectedArtifact(null)}
        fileUrl={selectedArtifact?.fileUrl || ''}
        title={selectedArtifact?.title || ''}
      />
    </div>
  );
};
4. Intégration dans le Parcours (Journey Simulator)
Pour créer une expérience cohérente, voici où placer ces éléments dans votre application existante (journey-simulator).

Modification de JourneyWorkspace.tsx
Ajoutez une section ou un onglet "Artifacts" à côté du Chat ou en dessous.

TypeScript

// Exemple d'intégration simplifiée
import { ProjectAssets } from './Artifacts/ProjectAssets';

const JourneyWorkspace = () => {
  return (
    <div className="flex h-screen bg-[#0A0A1F]">
      {/* Sidebar Navigation... */}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar... */}
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section Zyno Chat (Existant) */}
          <section className="min-h-[400px]">
            {/* ... Votre composant Chat actuel ... */}
          </section>

          {/* NOUVELLE SECTION: Artifacts */}
          <section className="border-t border-white/10 pt-8">
             <ProjectAssets />
          </section>

        </div>
      </main>
    </div>
  )
}
5. Détails UI & Expérience Utilisateur (UX)
Pour assurer que le MVP soit bluffant ("Wow effect"), suivez ces directives de style pour les fichiers HTML générés (ceux fournis précédemment) et l'interface React :

Glassmorphism Sombre : Utilisez systématiquement des arrière-plans rgba(19, 19, 43, 0.7) avec backdrop-filter: blur(12px) et des bordures fines border-white/10.

Typographie :

Titres : Space Grotesk (technologique, futuriste).

Corps : Inter (lisible, propre).

Code/Données : JetBrains Mono ou monospace.

Palette de Couleurs (Solana Native) :

Fond : #0A0A1F (Deep Space).

Primaire : #A020F0 (Purple).

Secondaire : #14F195 (Solana Green) pour les succès/validations.

Accents : #00E5FF (Cyan) pour les éléments technologiques.

6. Plan d'Action pour le Développeur
Copie des Fichiers HTML : Prenez les 4 codes HTML générés lors de l'étape précédente et sauvegardez-les dans public/generated/.

Création du JSON : Créez src/data/artifacts.json avec la structure fournie.

Intégration des Composants : Copiez les codes React (ArtifactCard, ArtifactModal, ProjectAssets) dans votre dossier composants.

Mise en place dans la Page : Importez ProjectAssets dans votre page principale de Journey/Dashboard.

Test : Lancez le serveur de dev (npm run dev), cliquez sur une carte "Unlocked" et vérifiez que la modale s'ouvre bien avec le contenu HTML riche à l'intérieur.

Ceci fournit une simulation haute fidélité de la capacité de "Money Factory AI" à produire du travail réel, ce qui est crucial pour convaincre les investisseurs lors d'une démo MVP.
