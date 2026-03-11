# 📐 PLAN DE RÉORGANISATION PROFESSIONNELLE
## Money Factory AI - Architecture D'Ingénierie

---

## 🎯 Objectifs

1. **Éliminer les doublons** (docs vs code source)
2. **Centraliser la configuration**
3. **Structurer la documentation**
4. **Nettoyer les artefacts générés**
5. **Créer une racine professionnelle avec README clair**
6. **Préserver tout le code fonctionnel**

---

## 📊 Analyse Actuelle

### Problèmes Identifiés

| Problème | Impact | Solution |
|----------|--------|----------|
| Pas de README.md racine | 🔴 Critique | Créer README professionnel |
| 3 node_modules (2.9GB) | 🔴 Taille | .gitignore + npm workspaces |
| docs/ doublonne avec src/ | 🟠 Élevé | Fusionner/supprimer doublons |
| 15+ scripts fix-* dans mf-back | 🟠 Élevé | Archiver/Supprimer |
| Fichiers générés (1.9MB+89KB) | 🟡 Moyen | Supprimer |
| Dossiers outils IA cachés | 🟡 Moyen | Archiver ou supprimer |
| Documentation fragmentée (44 dossiers) | 🟡 Moyen | Restructurer |

### Structure Actuelle
```
journey_mfai_back_front/
├── web/                    (Next.js - 1.9G, node_modules 1.5G)
├── mf-back/                (Express - 325M, node_modules 321M)
├── journey-simulator/      (React - 1.3G, node_modules 1.1G)
├── docs/                   (190 fichiers, 44 dossiers, 3.5M)
├── packages/               (Partagé - partiel)
├── scripts/                (Scripts globaux)
├── tools/                  (Outils divers)
├── ui-e2e/                 (Tests E2E)
├── backend/                (Backend - obsolète?)
├── data/                   (Données)
├── artifacts/              (Artefacts)
├── .agent/                 (Outil IA)
├── .antigravity/           (Outil IA)
├── .context/               (Outil IA)
├── .serena/                (Outil IA)
├── .zencoder/              (Outil IA)
└── [configs à la racine]   (22 fichiers)
```

---

## 🏗️ Architecture Cible

### Structure Professionnelle
```
money-factory-ai/              # Renommer racine (optionnel)
├── README.md                  # ⭐ README principal professionnel
├── LICENSE
├── package.json               # Workspace monorepo
├── Makefile                   # Commandes standardisées
├── docker-compose.yml         # Docker unifié
├── .env.example               # Variables d'environnement template
├── .gitignore                 # Global optimisé
│
├── apps/                      # Applications
│   ├── web/                   # Next.js 14 (authoritative)
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src/
│   │   ├── prisma/           # Source de vérité schéma
│   │   └── ...
│   │
│   └── api/                   # mf-back renommé (Express + Agents)
│       ├── README.md
│       ├── package.json
│       ├── src/
│       └── ...
│
├── packages/                  # Packages partagés
│   ├── shared-types/          # Types TypeScript
│   ├── shared-utils/          # Utils communs
│   ├── solana-tools/          # Web3/Solana
│   └── ui-components/         # Composants UI (si partagé)
│
├── docs/                      # Documentation unifiée
│   ├── README.md              # Guide docs
│   ├── architecture/          # Architecture technique
│   ├── api/                   # Documentation API
│   ├── deployment/            # Déploiement & Ops
│   ├── security/              # Sécurité
│   ├── product/               # Produit & Vision
│   └── contributing/          # Contribution & Dev
│
├── infra/                     # Infrastructure
│   ├── docker/                # Dockerfiles
│   ├── k8s/                   # Kubernetes manifests
│   ├── terraform/             # IaC (futur)
│   └── scripts/               # Scripts d'infra
│
├── scripts/                   # Scripts de développement
│   ├── setup.sh               # Setup initial
│   ├── dev.sh                 # Démarrage dev
│   ├── test.sh                # Tests
│   ├── build.sh               # Build production
│   └── security/              # Scripts sécurité
│
├── tests/                     # Tests globaux
│   ├── e2e/                   # Tests E2E
│   ├── integration/           # Tests intégration
│   └── fixtures/              # Données de test
│
└── .github/                   # GitHub
    ├── workflows/             # CI/CD
    ├── ISSUE_TEMPLATE/
    └── PULL_REQUEST_TEMPLATE.md
```

---

## 📁 Actions de Réorganisation

### Phase 1: Nettoyage Immédiat (Sans risque)

#### 1.1 Supprimer Fichiers Générés
```bash
# Supprimer
- tous_les_markdowns.txt (1.9MB)
- arborescence.txt (89KB)
- verification_proof.txt
- *.log (backend.log, frontend.log)
```

#### 1.2 Archiver Outils IA
```bash
# Déplacer vers .tools/ia/ ou supprimer
- .agent/
- .antigravity/
- .context/
- .serena/
- .zencoder/
```

#### 1.3 Nettoyer Scripts Redondants
```bash
# mf-back/ : 15+ scripts fix-* -> Archiver
- fix-all-missing-mocks.sh
- fix-all-remaining-imports.sh
- fix-all-remaining-tests.sh
- ...etc
```

### Phase 2: Documentation

#### 2.1 Structure Cible docs/
```
docs/
├── README.md                          # Index docs
├── 00-QUICKSTART.md                   # Démarrage rapide
│
├── 10-ARCHITECTURE/                   # Architecture
│   ├── README.md
│   ├── system-overview.md             # Vue d'ensemble
│   ├── web-app.md                     # Web (Next.js)
│   ├── api-service.md                 # API (Express)
│   ├── database.md                    # PostgreSQL/Prisma
│   ├── agents-system.md               # Système d'agents
│   └── solana-integration.md          # Web3
│
├── 20-API/                            # API Documentation
│   ├── README.md
│   ├── authentication.md
│   ├── journeys.md
│   ├── agents.md
│   └── web3.md
│
├── 30-DEPLOYMENT/                     # Déploiement
│   ├── README.md
│   ├── local-development.md
│   ├── docker-setup.md
│   ├── production-checklist.md
│   └── environment-variables.md
│
├── 40-SECURITY/                       # Sécurité
│   ├── README.md
│   ├── secrets-management.md
│   ├── audit-reports/                 # Rapports d'audit
│   └── compliance/                    # Conformité
│
├── 50-PRODUCT/                        # Produit
│   ├── README.md
│   ├── vision.md
│   ├── roadmap.md
│   └── user-personas.md
│
└── 90-CONTRIBUTING/                   # Contribution
    ├── README.md
    ├── code-style.md
    ├── testing-guide.md
    └── pull-requests.md
```

#### 2.2 Fusionner Documentation Doublonnée
- `docs/web/` → Supprimer (doublon avec `web/`)
- `docs/mf-back/` → Supprimer (doublon avec `mf-back/`)
- `docs/journey-simulator/` → Archiver (legacy)
- `docs/archive/` → Déplacer vers `.archive/docs/`
- `docs/root/` → Fusionner avec racine

### Phase 3: Applications

#### 3.1 Simplifier Structure
```
apps/
├── web/           (anciennement à racine)
└── api/           (anciennement mf-back/)

# journey-simulator/ -> Archiver comme legacy
# ou fusionner dans apps/web/ si utile
```

#### 3.2 Package.json Workspace
Créer workspace npm/yarn/pnpm pour gérer les dépendances.

### Phase 4: Configuration Centralisée

#### 4.1 À la Racine
```
.env.example              # Template unique
.env.local                # Local (gitignored)
docker-compose.yml        # Unifié
Makefile                  # Commandes standards
```

#### 4.2 Supprimer Doublons
- 5+ docker-compose.*.yml → Fusionner
- 5+ .env.* → Centraliser

---

## 🧪 Validation

### Checklist Pré-Réorganisation
- [ ] Sauvegarde complète git
- [ ] Tests passent avant modifications
- [ ] Liste des fichiers critiques identifiée

### Checklist Post-Réorganisation
- [ ] `npm install` fonctionne
- [ ] `npm run dev` fonctionne
- [ ] `npm run build` fonctionne
- [ ] `npm run test` fonctionne
- [ ] Docker compose up fonctionne
- [ ] README est clair et complet

---

## ⏱️ Planification

| Phase | Durée Estimée | Risque |
|-------|---------------|--------|
| Phase 1: Nettoyage | 30 min | 🟢 Faible |
| Phase 2: Documentation | 1h | 🟡 Moyen |
| Phase 3: Applications | 1h | 🟠 Élevé |
| Phase 4: Configuration | 30 min | 🟡 Moyen |
| **Total** | **~3h** | **🟡 Contrôlé** |

---

## 🚀 Commandes de Vérification Post-Op

```bash
# Structure
find apps -type f -name "*.ts" -o -name "*.tsx" | wc -l
du -sh apps/*

# Documentation
find docs -type f -name "*.md" | wc -l

# Tests
npm run test:all

# Build
npm run build
```

---

*Plan créé: 2026-03-11*  
*Objectif: Architecture professionnelle digne d'un projet d'ingénierie*
