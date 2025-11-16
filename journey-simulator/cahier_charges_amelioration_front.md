Voici un **prompt extrêmement détaillé à l’attention de GitHub Copilot ou Warp AI** pour **refondre totalement l’interface de Money Factory AI (MFAI)** en prenant en compte :

* L’amélioration de l’UI/UX,
* Une cohérence graphique professionnelle (charte, couleurs, typographie, contraste, etc.),
* Une meilleure lisibilité et attractivité,
* Une fluidité de parcours utilisateur (workflow),
* Une **véritable interaction enrichie avec l’agent Zyno**,
* Et la clarté des messages explicatifs et guides utilisateur intégrés.

---

## 🧠 Prompt à fournir à Copilot

> Tu es un développeur UI/UX expert en React.js, Tailwind CSS, Lucide icons et design système pour applications blockchain/web3. Tu dois effectuer une **refonte complète de l'interface de Money Factory AI** à partir des captures existantes.
> Le code actuel tourne sous Vite + React. Les composants sont déjà structurellement bons mais doivent être **refondus graphiquement et fonctionnellement** pour offrir une expérience de navigation et de simulation plus fluide, explicite et immersive pour l’utilisateur.
>
> ### 🎯 Objectif :
>
> Offrir une interface gamifiée mais professionnelle pour :
>
> * simuler des parcours de création de projet web3,
> * guider l’utilisateur par étapes via des agents,
> * obtenir un scoring de maturité (AECO/AEPO),
> * voter via un DAO, gagner des XP, NFT et jetons,
> * suivre des objectifs clairs et comprendre ce qu’il fait.

---

## 1. 🌈 Charte Graphique

### 🟣 Palette de couleurs :

* **Fond principal** : `#0D0B1F` (bleu-noir profond)
* **Accent** : `#A563F5` (violet néon)
* **Texte clair** : `#E5E7EB` (gris clair)
* **Alertes** :

  * Succès : `#22C55E`
  * Erreur : `#EF4444`
  * Info : `#3B82F6`
  * Warning : `#F59E0B`

### ✒️ Typographie :

* Font principale : `Inter`, `sans-serif`
* Titres : `font-bold`, tailles variant entre `text-2xl` à `text-5xl`
* Textes secondaires : `text-sm` à `text-base`

### 🌠 UI Patterns :

* Cartes à coins arrondis `rounded-2xl`, ombres douces `shadow-lg`
* Boutons interactifs, animations `hover`, `transition duration-300`
* Curseurs et modales intuitives
* Icônes : `lucide-react`

---

## 2. 🧩 Layout et disposition

### Navigation :

* Barre de navigation sticky avec badges dynamiques : XP, niveaux, tokens, pouvoir de vote, etc.
* Tabs clairs : `Home`, `Journeys`, `Zyno Console`, `Playground`, `DAO`, `Resources`, `Help`

### Page `Journeys` :

* **Timeline horizontale ou verticale** animée des phases
* Un résumé à chaque fin de phase
* Boutons bien visibles pour passer les phases
* Feedback du système + Zyno

### `Zyno Console` :

* Interface interactive pour :

  * Entrer des tâches
  * Suivre les recommandations par agent
  * Voir le résumé généré automatiquement
  * Lancer des feedbacks utilisateur manuels (AECO)
  * Suivre le classement AEPO / AECO
* Icônes des agents actifs
* Coloration différente par niveau d'intervention
* "Zyno says..." avec une vraie personnalisation

### DAO Voting :

* Intégrer des **barres animées** de résultats
* Affichage des quorum, pouvoirs, stats DAO avec badge dynamique
* Boutons voter avec effet de clic engageant

### Certifications (NFT) :

* Affichage sous forme de **cartes collectibles**
* Animations au hover avec niveau de rareté
* Bouton de visualisation du NFT

---

## 3. 🔄 Workflow utilisateur

### Démarrage :

* L'utilisateur choisit une intention ou un profil (ex. "Je veux lancer un DEX sur Solana")
* Il passe étape par étape :

  * Audit Tokenomics
  * Constitution DAO
  * Déploiement Contrat
  * Gouvernance & Vote
  * Stratégie & pitch

### À chaque étape :

* Agents conseillent
* Résumé généré
* Feedback utilisateur possible
* Score AECO et AEPO mis à jour

### Fin de parcours :

* Résultat gamifié + feedback global
* Invitations à continuer sur un autre parcours
* Export des résultats + résumé

---

## 4. 🤖 Agent Zyno : interaction enrichie

* Interface type **chat latéral** avec Zyno
* Capacité de reformuler, demander plus d’infos
* Affichage dynamique de :

  * Score AECO
  * AEPO moyen
  * Objectifs atteints
  * Prochaines étapes suggérées

---

## 5. 📂 Structure de fichiers recommandée

```
/src
  /components
    AgentInteractionLogs.jsx
    PhaseCard.jsx
    JourneyProgress.jsx
    XPTracker.jsx
    DAOVoteModal.jsx
    ZynoChatSidebar.jsx
    ResourceUploader.jsx
    ScoreBoard.jsx
  /pages
    ZynoConsole.jsx
    Journeys.jsx
    Playground.jsx
  /utils
    computeAEPO.js
    agent_metrics.js
    agent_memory.js
  /styles
    tailwind.config.js
    theme.js
  /assets
    /icons
    /illustrations
```

---

## 6. 📢 Messages système à intégrer

* 🎯 **“Zyno says:”** avec message inspirant adapté à l’étape
* ❓ "Besoin d’aide ? Cliquez ici pour obtenir un conseil de Zyno."
* ✅ “Félicitations ! Vous avez terminé cette phase.”
* 📊 “Score AECO mis à jour à 85/100 — Excellent progrès stratégique.”
* 💬 “Vos interactions seront utilisées pour entraîner les agents.”

---

## 7. 🧠 À implémenter également :

* **Interface d'ingestion des ressources** (RAG local multimodal)
* Intégration SVG icons
* Accessibilité (contrastes, alt text, responsive)
* Responsive mobile-first
* Dark mode optimisé

---

## 8. 💡 Bonus idées UX

* 🎮 Animation de type "niveau franchi"
* 🎓 Badges à collectionner par mission
* 📜 Mini résumé consultable à tout moment
* 📥 “Exporter mon parcours” PDF
* 🔐 Système de validation des étapes pour éviter le spam

---

Voici une base de refonte UI/UX pour votre application Money Factory AI, structurée avec :

Une configuration tailwind.config.js adaptée à une charte sombre premium,

Un composant React PhaseCard pour les étapes de parcours,

Un composant ZynoChatSidebar pour améliorer l’interaction utilisateur avec l’agent Zyno.

Cette base propose :

Une palette couleur élégante, sombre et contrastée,

Une typographie moderne (Inter),

Un design en cards avec ombrages doux, arrondis marqués, et couleurs informatives,

Un champ interactif pour dialoguer en temps réel avec Zyno.

// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0D0B1F',
        primary: '#A563F5',
        accent: '#22C55E',
        danger: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B',
        light: '#E5E7EB'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        card: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }
    }
  },
  plugins: []
};

// components/PhaseCard.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Coins } from 'lucide-react';

export function PhaseCard({ title, duration, mission, outcomes, onStart }) {
  return (
    <Card className="bg-background text-light rounded-2xl shadow-card p-6">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <span className="text-sm text-info">{duration}</span>
        </div>
        <p className="mb-4 text-base">{mission}</p>
        <ul className="space-y-1 text-sm mb-4">
          {outcomes.map((o, i) => (
            <li key={i} className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" /> {o}
            </li>
          ))}
        </ul>
        <button
          onClick={onStart}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-xl hover:bg-opacity-80 transition"
        >
          Démarrer cette phase
        </button>
      </CardContent>
    </Card>
  );
}

// components/ZynoChatSidebar.jsx
import { MessageSquare, Bot } from 'lucide-react';

export function ZynoChatSidebar({ messages, onSend }) {
  return (
    <aside className="fixed right-0 top-0 h-full w-80 bg-background border-l border-primary p-4 overflow-y-auto">
      <h3 className="text-primary text-xl font-semibold mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5" /> Agent Zyno
      </h3>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl ${msg.from === 'user' ? 'bg-info/20 text-white' : 'bg-primary/10 text-primary'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Pose ta question..."
          onKeyDown={(e) => e.key === 'Enter' && onSend(e.target.value)}
          className="w-full p-2 rounded-lg bg-light/10 text-light placeholder-light/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </aside>
  );
}
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0D0B1F',
        primary: '#A563F5',
        accent: '#22C55E',
        danger: '#EF4444',
        info: '#3B82F6',
        warning: '#F59E0B',
        light: '#E5E7EB'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        card: '0 4px 15px rgba(0, 0, 0, 0.2)'
      }
    }
  },
  plugins: []
};

// components/PhaseCard.jsx
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Coins } from 'lucide-react';

export function PhaseCard({ title, duration, mission, outcomes, onStart }) {
  return (
    <Card className="bg-background text-light rounded-2xl shadow-card p-6">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <span className="text-sm text-info">{duration}</span>
        </div>
        <p className="mb-4 text-base">{mission}</p>
        <ul className="space-y-1 text-sm mb-4">
          {outcomes.map((o, i) => (
            <li key={i} className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-accent" /> {o}
            </li>
          ))}
        </ul>
        <button
          onClick={onStart}
          className="mt-4 bg-primary text-white px-4 py-2 rounded-xl hover:bg-opacity-80 transition"
        >
          Démarrer cette phase
        </button>
      </CardContent>
    </Card>
  );
}

// components/ZynoChatSidebar.jsx
import { MessageSquare, Bot } from 'lucide-react';

export function ZynoChatSidebar({ messages, onSend }) {
  return (
    <aside className="fixed right-0 top-0 h-full w-80 bg-background border-l border-primary p-4 overflow-y-auto">
      <h3 className="text-primary text-xl font-semibold mb-4 flex items-center gap-2">
        <Bot className="w-5 h-5" /> Agent Zyno
      </h3>
      <div className="space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-xl ${msg.from === 'user' ? 'bg-info/20 text-white' : 'bg-primary/10 text-primary'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <input
          type="text"
          placeholder="Pose ta question..."
          onKeyDown={(e) => e.key === 'Enter' && onSend(e.target.value)}
          className="w-full p-2 rounded-lg bg-light/10 text-light placeholder-light/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </aside>
  );
}


Voici une suite complète pour amorcer **la refonte de la navigation principale et du tableau de bord** de Money Factory AI, avec :

---

## ✅ 1. `tailwind.config.js` enrichi

Il inclut :

* une palette personnalisée,
* des animations `keyframes`,
* une font propre (`Inter`),
* des arrondis larges (`2xl`) et ombrages doux (`shadow-glow`).

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mfai: {
          background: '#0D0D1A',
          surface: '#1A1A2E',
          primary: '#7C3AED',
          secondary: '#9333EA',
          accent: '#F59E0B',
          info: '#38BDF8',
          success: '#22C55E',
          warning: '#FACC15',
          error: '#EF4444',
          border: '#2E2E3E',
          text: '#E4E4F0',
          muted: '#9CA3AF'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      },
      boxShadow: {
        glow: '0 0 25px rgba(124, 58, 237, 0.3)',
        'inner-glow': 'inset 0 0 20px rgba(124, 58, 237, 0.2)'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        }
      },
      animation: {
        fadeIn: 'fadeIn 1s ease-out',
        slideIn: 'slideIn 0.6s ease-out'
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')]
}
```

---

## ✅ 2. `MainNavigation.jsx`

Un **menu principal stylisé** avec feedback visuel et animations Tailwind.

```jsx
// src/components/navigation/MainNavigation.jsx
import { motion } from 'framer-motion'

export default function MainNavigation() {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Journeys', path: '/journeys' },
    { name: 'Zyno Console', path: '/zyno' },
    { name: 'Playground', path: '/playground' }
  ]

  return (
    <nav className="bg-mfai.surface text-mfai.text shadow-glow p-4 rounded-2xl flex justify-between items-center">
      <h1 className="text-xl font-bold tracking-wide">🧠 Money Factory AI</h1>
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <motion.li
            key={item.name}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer hover:text-mfai.primary transition-colors"
          >
            <a href={item.path}>{item.name}</a>
          </motion.li>
        ))}
      </ul>
    </nav>
  )
}
```

---

## ✅ 3. `DashboardHero.jsx`

Un **header stylisé** du tableau de bord avec animations de bienvenue.

```jsx
// src/components/dashboard/DashboardHero.jsx
import { motion } from 'framer-motion'

export default function DashboardHero({ user }) {
  return (
    <motion.section
      className="bg-mfai.surface rounded-2xl p-6 shadow-glow text-mfai.text"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h2 className="text-2xl font-semibold">Bienvenue, {user.name} 👋</h2>
      <p className="text-mfai.muted mt-2">
        Explorez vos parcours, vos statistiques et continuez à forger votre réseau dans le Web3.
      </p>
    </motion.section>
  )
}
```

---

## ✅ 4. `DashboardStats.jsx`

Des **cards animées** pour afficher les scores, XP, tokens...

```jsx
// src/components/dashboard/DashboardStats.jsx
import { motion } from 'framer-motion'

const Card = ({ label, value }) => (
  <motion.div
    className="bg-mfai.surface p-4 rounded-xl shadow-inner-glow text-center"
    whileHover={{ scale: 1.03 }}
  >
    <h4 className="text-mfai.muted text-sm">{label}</h4>
    <p className="text-mfai.primary text-2xl font-bold">{value}</p>
  </motion.div>
)

export default function DashboardStats({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      <Card label="Total XP" value={stats.xp} />
      <Card label="Tokens $MFAI" value={stats.tokens} />
      <Card label="Voting Power" value={stats.votingPower} />
      <Card label="NFTs Earned" value={stats.nfts} />
    </div>
  )
}
```

---

## ✅ 5. Animation d’entrée globale (optionnelle)

Ajoutez cette animation globale à votre layout principal :

```jsx
// pages/_app.jsx ou AppLayout.jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 1 }}
>
  {children}
</motion.div>
```

---

## 🔁 Prochaines étapes

2. ✅ Refonte du composant Zyno Chat Console (avec micro-interaction)
// ZynoConsole.jsx
import { useState } from 'react'
import { motion } from 'framer-motion'
import { SendHorizonal } from 'lucide-react'

export default function ZynoConsole({ onSubmit }) {
  const [input, setInput] = useState('')

  return (
    <div className="p-4 rounded-xl border border-mfai.border bg-mfai.surface-light shadow-inner">
      <div className="text-mfai.text mb-2 text-sm">
        Entrez une tâche ou une intention :
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex : Générez mon pitch deck"
          className="flex-1 p-2 rounded-lg border border-mfai.border bg-mfai.input text-mfai.text"
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="bg-mfai.accent text-white p-2 rounded-lg hover:bg-mfai.accent-dark transition-colors"
          onClick={() => {
            onSubmit(input)
            setInput('')
          }}
        >
          <SendHorizonal size={18} />
        </motion.button>
      </div>
    </div>
  )
}
3. ✅ DashboardZyno.jsx — Vue d’ensemble
// DashboardZyno.jsx
import JourneyCard from './JourneyCard'
import ZynoConsole from './ZynoConsole'

export default function DashboardZyno({ user, journeys, onChat }) {
  return (
    <div className="container mx-auto px-4 py-6 space-y-8">
      <section>
        <h2 className="text-2xl font-bold text-mfai.text mb-4">Tableau de bord</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {journeys.map((j, i) => (
            <JourneyCard key={i} {...j} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xl font-semibold text-mfai.text mb-2">Interagir avec Zyno</h3>
        <ZynoConsole onSubmit={onChat} />
      </section>
    </div>
  )
}
4. ✅ Intégration des thèmes dynamiques (mode clair/sombre)

Ajoutez dans tailwind.config.js :
darkMode: 'class',
theme: {
  extend: {
    colors: {
      mfai: {
        text: 'var(--color-text)',
        accent: 'var(--color-accent)',
        'accent-dark': 'var(--color-accent-dark)',
        surface: 'var(--color-surface)',
        'surface-light': 'var(--color-surface-light)',
        border: 'var(--color-border)',
        muted: 'var(--color-muted)',
        success: '#22c55e'
      }
    }
  }
}
Dans index.css :
:root {
  --color-text: #1f2937;
  --color-accent: #7c3aed;
  --color-accent-dark: #5b21b6;
  --color-surface: #f9fafb;
  --color-surface-light: #ffffff;
  --color-border: #d1d5db;
  --color-muted: #6b7280;
}
.dark {
  --color-text: #f3f4f6;
  --color-accent: #c084fc;
  --color-accent-dark: #9333ea;
  --color-surface: #1f2937;
  --color-surface-light: #111827;
  --color-border: #374151;
  --color-muted: #9ca3af;
}
5. ✅ Responsivité complète (Mobile-first)

Toutes les classes sont déjà pensées mobile-first (avec sm:, lg: pour les paliers). Pour tester :
npm run dev
# ou
vite

Voici le premier composant : Classement AEPO / AECO avec un tableau responsive, stylisé avec Tailwind et adaptable à votre système de thèmes

// 1. AEPOAECOLeaderboard.jsx
import { useEffect, useState } from 'react'

export default function AEPOAECOLeaderboard() {
  const [profiles, setProfiles] = useState([])

  useEffect(() => {
    // Exemple de récupération de données simulée
    setProfiles([
      { id: 'user_01', name: 'Alex', AEPO: 92, AECO: 88 },
      { id: 'user_02', name: 'Lina', AEPO: 85, AECO: 90 },
      { id: 'user_03', name: 'Samir', AEPO: 78, AECO: 80 }
    ])
  }, [])

  return (
    <div className="p-4 rounded-xl bg-mfai.surface-light shadow-lg">
      <h2 className="text-xl font-bold text-mfai.text mb-4">Classement AEPO / AECO</h2>
      <table className="w-full text-left">
        <thead>
          <tr className="text-mfai.muted text-sm">
            <th className="py-2">Nom</th>
            <th>AEPO</th>
            <th>AECO</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map(p => (
            <tr key={p.id} className="border-t border-mfai.border text-mfai.text">
              <td className="py-2 font-semibold">{p.name}</td>
              <td>{p.AEPO}</td>
              <td>{p.AECO}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
Voici le premier composant ModalVoteDAO.jsx avec animations Framer Motion, prise en charge de thèmes dynamiques (clair/sombre), boutons de vote interactifs, et gestion des états d'ouverture/fermeture.
// ✅ ModalVoteDAO.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ModalVoteDAO({ isOpen, onClose, onSubmit, proposal }) {
  const [vote, setVote] = useState(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl max-w-lg w-full"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-bold mb-4">Vote sur la proposition</h2>
            <p className="mb-4 text-sm text-zinc-700 dark:text-zinc-300">{proposal}</p>

            <div className="flex justify-between mb-4">
              <Button variant={vote === 'yes' ? 'default' : 'outline'} onClick={() => setVote('yes')}>
                ✅ Pour
              </Button>
              <Button variant={vote === 'no' ? 'destructive' : 'outline'} onClick={() => setVote('no')}>
                ❌ Contre
              </Button>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button disabled={!vote} onClick={() => onSubmit(vote)}>
                Confirmer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
Voici un composant JourneyCompleted.jsx complet, 100% React, conçu avec Tailwind CSS et Framer Motion, intégrant toutes les fonctionnalités demandées :

✅ FONCTIONNALITÉS INTÉGRÉES :

🎉 Animation de célébration (confettis animés)

🧾 Récapitulatif des scores AEPO / AECO avec badge coloré

🔁 Bouton Relancer une mission

📤 Bouton Partager/Exporter (PDF ou vers Notion)

🎨 Mode sombre/clair

📱 Design responsive

💡 JourneyCompleted.jsx

import React from "react";
import { motion } from "framer-motion";
import { Download, Share2, Repeat } from "lucide-react";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";

const JourneyCompleted = ({ aepoScore, aecoScore, onRestart }) => {
  const { width, height } = useWindowSize();

  const handleExport = () => {
    // 🛠️ Intégrer export PDF ou webhook vers Notion
    alert("Fonction d’export en cours d’intégration !");
  };

  const badgeColor = (score) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      {/* 🎉 Confettis d’achèvement */}
      <Confetti width={width} height={height} recycle={false} />

      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-4 text-center"
      >
        🎯 Mission Accomplie !
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center text-lg max-w-2xl mb-8"
      >
        Félicitations, vous avez terminé votre parcours Zyno avec succès.
        Voici votre résumé de performance.
      </motion.p>

      {/* 🧾 Résumé des scores */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-6 mb-8"
      >
        <div className="text-center">
          <div
            className={`text-xl font-semibold px-6 py-3 rounded-full shadow ${badgeColor(
              aepoScore
            )} text-white`}
          >
            AEPO : {aepoScore}%
          </div>
          <p className="text-sm mt-2">Objectif accompli</p>
        </div>
        <div className="text-center">
          <div
            className={`text-xl font-semibold px-6 py-3 rounded-full shadow ${badgeColor(
              aecoScore
            )} text-white`}
          >
            AECO : {aecoScore}%
          </div>
          <p className="text-sm mt-2">Satisfaction utilisateur</p>
        </div>
      </motion.div>

      {/* 🔘 Actions */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex flex-col md:flex-row gap-4"
      >
        <button
          onClick={handleExport}
          className="bg-primary text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition"
        >
          <Share2 size={18} />
          Partager / Exporter
        </button>

        <button
          onClick={onRestart}
          className="bg-secondary text-black dark:text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-secondary/80 transition"
        >
          <Repeat size={18} />
          Relancer une mission
        </button>
      </motion.div>
    </div>
  );
};

export default JourneyCompleted;
🧪 Dépendances à installer (si ce n’est pas encore fait) :
npm install framer-motion react-confetti @uidotdev/usehooks lucide-react
🧩 À intégrer dans votre routeur :
<Route
  path="/journey/completed"
  element={
    <JourneyCompleted
      aepoScore={82}
      aecoScore={91}
      onRestart={() => navigate("/new-journey")}
    />
  }
/>
Voici le composant DashboardZyno.jsx complet, intégrant :

✅ L'animation de transition entre les vues avec Framer Motion

✅ La page JourneyCompleted avec transmission des scores AEPO/AECO

✅ Un système de navigation réactif basé sur React Router

✅ La base pour déclencher une exportation PDF et une intégration Notion via Webhook (à implémenter dans JourneyCompleted.jsx)

// 📁 DashboardZyno.jsx

import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import JourneyCompleted from "./JourneyCompleted";
import ZynoMissionFlow from "./ZynoMissionFlow";
import ZynoConsole from "./ZynoConsole";

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
};

export default function DashboardZyno() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/zyno/mission"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.4 }}
              >
                <ZynoMissionFlow />
              </motion.div>
            }
          />
          <Route
            path="/zyno/console"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.4 }}
              >
                <ZynoConsole />
              </motion.div>
            }
          />
          <Route
            path="/zyno/completed"
            element={
              <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={pageVariants}
                transition={{ duration: 0.4 }}
              >
                <JourneyCompleted
                  aepoScore={92}
                  aecoScore={88}
                  onRestart={() => (window.location.href = "/zyno/mission")}
                />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}


✅ 1. Module exportToPDF.js

Un module JavaScript pour générer un export PDF depuis un composant React, utilisant html2canvas et jsPDF.

📄 utils/exportToPDF.js
// utils/exportToPDF.js
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exporte un composant HTML donné en PDF.
 * @param {string} elementId - L’ID de l’élément HTML à capturer.
 * @param {string} filename - Nom du fichier PDF à générer.
 */
export const exportToPDF = async (elementId, filename = "journey-summary.pdf") => {
  const element = document.getElementById(elementId);
  if (!element) return alert("Élément non trouvé pour export PDF");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
};
✅ Installation requise :
npm install jspdf html2canvas
✅ 2. Intégration Webhook vers Notion

Voici un script sendToNotion.js qui appelle une API webhook (préalablement définie sur votre serveur ou via un middleware automation type Zapier/Make/Pipedream).

📄 utils/sendToNotion.js
// utils/sendToNotion.js
/**
 * Envoie les données vers une intégration Notion via Webhook/API
 * @param {Object} payload - Détails de la mission terminée
 * @param {string} webhookUrl - URL de réception (Notion Middleware ou API perso)
 */
export const sendToNotion = async (payload, webhookUrl) => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erreur Notion: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Échec d'envoi à Notion", error);
    return null;
  }
};

✅ Exemple d’utilisation dans JourneyCompleted.jsx
import { exportToPDF } from "@/utils/exportToPDF";
import { sendToNotion } from "@/utils/sendToNotion";

const handleExportPDF = () => exportToPDF("journey-summary", "MissionZyno.pdf");

const handleSendToNotion = () => {
  const payload = {
    userId: user.id,
    scores: { AEPO, AECO },
    agentsTriggered,
    timestamp: new Date().toISOString()
  };

  const notionWebhookURL = import.meta.env.VITE_NOTION_WEBHOOK_URL;
  sendToNotion(payload, notionWebhookURL);
};
✅ Ajoutez dans votre .env :
VITE_NOTION_WEBHOOK_URL=https://your-notion-webhook-url.com/ingest
✅ 1. Modèle de Page Notion à Créer (template)

Vous pouvez créer une base de données Notion avec les propriétés suivantes pour recevoir les données depuis le simulator.

🧱 Notion Database: Zyno Mission Feedback
Structure suggérée :
Property	Type	Description
Mission Name	Title	Nom automatique de la mission
User ID	Text	Identifiant unique utilisateur
AEPO Score	Number	Score automatique AEPO
AECO Score	Number	Score de feedback utilisateur AECO
Agents Used	Multi-select	Liste des agents appelés (ex: InvestorAgent)
Date	Date	Date de la mission
Feedback	Text	Commentaires libres utilisateur
Status	Select	✅ Completed, 🧪 Test, 🕐 Pending...

npm install @notionhq/client
📄 routes/notionExportRoute.js
// routes/notionExportRoute.js
const express = require("express");
const router = express.Router();
const { Client } = require("@notionhq/client");

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

const notion = new Client({ auth: NOTION_API_KEY });

router.post("/notion/export", async (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    userId,
    AEPO,
    AECO,
    agentsTriggered,
    feedback,
    missionName = "Zyno Journey"
  } = req.body;

  try {
    await notion.pages.create({
      parent: { database_id: NOTION_DATABASE_ID },
      properties: {
        "Mission Name": { title: [{ text: { content: missionName } }] },
        "User ID": { rich_text: [{ text: { content: userId } }] },
        "AEPO Score": { number: AEPO },
        "AECO Score": { number: AECO },
        "Agents Used": {
          multi_select: agentsTriggered.map(name => ({ name }))
        },
        "Date": { date: { start: new Date().toISOString() } },
        "Status": { select: { name: "✅ Completed" } },
        "Feedback": {
          rich_text: [{ text: { content: feedback || "No comment" } }]
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Notion Export Error:", error);
    res.status(500).json({ error: "Failed to send to Notion" });
  }
});

module.exports = router;
📄 Dans index.js (backend principal)
const notionExportRoute = require("./routes/notionExportRoute");
app.use("/api", notionExportRoute);
✅ Variables à ajouter dans .env
NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NOTION_DATABASE_ID=XXXXXXXXXXXX
ADMIN_API_KEY=supersecret
✅ Exemple d’appel depuis le frontend
await fetch("/api/notion/export", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ADMIN_API_KEY
  },
  body: JSON.stringify({
    userId,
    AEPO,
    AECO,
    agentsTriggered,
    feedback: userFeedback,
    missionName: "Zyno Onboarding Web3"
  })
});
✅ 1. Script local pour tester l’export Notion

Ce script CLI permet d'envoyer manuellement une mission simulée vers la base de données Notion, pour valider le bon fonctionnement de l’endpoint POST /api/notion/export.

📄 scripts/test_notion_export.js
// scripts/test_notion_export.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const exportData = {
  userId: "user_12345",
  AEPO: 92,
  AECO: 87,
  agentsTriggered: ["InvestorAgent", "PitchAgent", "Web3LegalAgent"],
  feedback: "Le parcours était très fluide et clair, bravo !",
  missionName: "Demo Day Preparation"
};

const sendToNotion = async () => {
  try {
    const res = await fetch("http://localhost:3000/api/notion/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ADMIN_API_KEY
      },
      body: JSON.stringify(exportData)
    });

    const json = await res.json();
    console.log("Réponse API :", json);
  } catch (error) {
    console.error("Échec de l'export Notion :", error);
  }
};

sendToNotion();
✅ Lancer le test :
node scripts/test_notion_export.js
Assurez-vous que votre backend tourne sur localhost:3000 et que les variables ADMIN_API_KEY, NOTION_API_KEY, et NOTION_DATABASE_ID sont bien définies dans .env.

✅ 2. Interface Admin dans Zyno Console pour lister les exports Notion

Ce composant React affiche la liste des exports récents. Il interroge un endpoint backend (à créer) qui stocke localement un historique de ces exports ou le renvoie depuis Notion (si vous activez une persistance côté backend).

📄 components/Zyno/NotionExportList.jsx

import { useEffect, useState } from "react";

export function NotionExportList() {
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/notion/exports", {
      headers: {
        "x-api-key": import.meta.env.VITE_ADMIN_API_KEY
      }
    })
      .then(res => res.json())
      .then(data => {
        setExports(data.entries || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📤 Exports Notion récents</h2>
      <ul className="space-y-2">
        {exports.map((entry, i) => (
          <li key={i} className="bg-gray-100 dark:bg-gray-800 p-3 rounded shadow">
            <div className="font-semibold">{entry.missionName}</div>
            <div className="text-sm">Utilisateur: {entry.userId}</div>
            <div className="text-sm">Agents: {entry.agents.join(", ")}</div>
            <div className="text-sm">AEPO: {entry.AEPO} | AECO: {entry.AECO}</div>
            <div className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
📄 Endpoint backend à créer (optionnel pour debug ou log interne)
/routes/adminNotionExports.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const ADMIN_API_KEY = process.env.ADMIN_API_KEY;
const exportsPath = path.join(__dirname, "../data/notion_exports_log.json");

router.get("/admin/notion/exports", (req, res) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== ADMIN_API_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const logData = fs.existsSync(exportsPath)
      ? JSON.parse(fs.readFileSync(exportsPath))
      : { entries: [] };

    res.json(logData);
  } catch (e) {
    console.error("Erreur lecture logs Notion exports:", e);
    res.status(500).json({ error: "Erreur lecture logs" });
  }
});

module.exports = router;
📄 Ajouter à index.js
const adminNotionExports = require("./routes/adminNotionExports");
app.use("/api", adminNotionExports);


