# 🏭 Money Factory AI (MFAI)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Solana](https://img.shields.io/badge/Solana-Devnet-purple.svg)](https://solana.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **AI-Powered Venture Engine on Solana**  
> Guiding entrepreneurs through Learn → Build → Govern → Launch with a swarm of 24+ AI agents.

---

## 🎯 Vision

Money Factory AI is an **AI-native venture engine** that democratizes entrepreneurship by providing:

- 🤖 **24+ AI Agents** (Zyno Orchestrator, CFO Agent, Architect Agent, etc.)
- 📚 **Learning Paths** structured in 4 phases: Learn, Build, Govern, Launch
- ⛓️ **Web3 Integration** with Solana blockchain (devnet → mainnet)
- 🎓 **Proof-of-Skill NFTs** minted on-chain
- 🏛️ **DAO Governance** for community-driven decisions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Money Factory AI                        │
├─────────────────────────────────────────────────────────────┤
│  Web App (Next.js 14)          API Service (Express)        │
│  ├─ App Router                  ├─ 32 AI Agents            │
│  ├─ React 18                    ├─ Zyno Orchestrator       │
│  ├─ Tailwind CSS                ├─ RAG + LLM Integration   │
│  ├─ SIWS Auth                   ├─ BullMQ Workers          │
│  └─ Prisma ORM                  └─ Solana Web3             │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis  │  BullMQ  │  Metaplex (Solana)    │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Express.js, Node.js, TypeScript |
| **AI/ML** | OpenAI GPT-4o, Custom Agent Framework, RAG |
| **Database** | PostgreSQL (Prisma ORM) |
| **Queue/Cache** | Redis, BullMQ |
| **Blockchain** | Solana Web3.js, Metaplex UMI, Devnet |
| **Testing** | Jest, Playwright, Vitest |
| **DevOps** | Docker, Docker Compose, PM2 |

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 18.17.0
- PostgreSQL 15+
- Redis 7+
- Git

### 1. Clone & Install

```bash
git clone https://github.com/cyranoaladin/journey-simulator.git
cd journey-simulator

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

```bash
# Copy environment templates
cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Edit with your values
nano .env
```

Required variables:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/mfai

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI (optional - mock mode works without)
OPENAI_API_KEY=sk-...

# Solana (devnet for development)
SOLANA_CLUSTER=devnet
```

### 3. Database Setup

```bash
cd apps/web
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### 4. Start Development

```bash
# Terminal 1: Start API
npm run dev:api

# Terminal 2: Start Web
npm run dev:web

# Or start all with Docker
npm run docker:dev
```

Access:
- Web App: http://localhost:3001
- API: http://localhost:3002
- API Docs: http://localhost:3002/api-docs

---

## 📁 Project Structure

```
money-factory-ai/
├── README.md                 # This file
├── LICENSE                   # MIT License
├── package.json              # Monorepo workspace config
├── Makefile                  # Standardized commands
├── docker-compose.yml        # Docker orchestration
│
├── apps/                     # Applications
│   ├── web/                  # Next.js 14 Web App
│   │   ├── src/              # Source code
│   │   ├── app/              # App Router (API routes + pages)
│   │   ├── prisma/           # Database schema (source of truth)
│   │   └── package.json
│   │
│   └── api/                  # Express API + AI Agents
│       ├── src/              # Source code
│       │   ├── agents/       # 32 AI Agents
│       │   ├── orchestration/# Zyno Orchestrator
│       │   ├── services/     # Business logic
│       │   └── controllers/  # HTTP handlers
│       └── package.json
│
├── packages/                 # Shared packages
│   ├── shared-types/         # TypeScript types
│   ├── shared-utils/         # Common utilities
│   └── solana-tools/         # Web3/Solana utilities
│
├── docs/                     # Documentation
│   ├── 00-QUICKSTART.md      # Getting started
│   ├── 10-ARCHITECTURE/      # System design
│   ├── 20-API/               # API documentation
│   ├── 30-DEPLOYMENT/        # Deployment guides
│   ├── 40-SECURITY/          # Security docs
│   └── 90-CONTRIBUTING/      # Contribution guide
│
├── infra/                    # Infrastructure
│   ├── docker/               # Dockerfiles
│   └── scripts/              # Deployment scripts
│
└── scripts/                  # Development scripts
    ├── setup.sh              # Initial setup
    ├── dev.sh                # Start dev environment
    └── security/             # Security utilities
```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:web      # Web app tests
npm run test:api      # API tests
npm run test:e2e      # Playwright E2E tests

# With coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Docker (Recommended)

```bash
# Production build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build

# Or use Make
make deploy
```

### Manual

```bash
# 1. Build applications
npm run build

# 2. Start production
npm run start:prod
```

See [docs/30-DEPLOYMENT/](docs/30-DEPLOYMENT/) for detailed deployment guides.

---

## 🔒 Security

- ✅ Secrets managed via environment variables
- ✅ Pre-commit hooks detect secrets
- ✅ SIWS (Sign-In With Solana) authentication
- ✅ Kill switch for Web3 transactions
- ✅ Input sanitization & validation

See [docs/40-SECURITY/](docs/40-SECURITY/) for security practices and audit reports.

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](docs/90-CONTRIBUTING/) first.

```bash
# 1. Fork the repository
# 2. Create your feature branch
git checkout -b feature/amazing-feature

# 3. Commit your changes
git commit -m 'Add amazing feature'

# 4. Push to the branch
git push origin feature/amazing-feature

# 5. Open a Pull Request
```

---

## 📝 Documentation

- **[Quick Start](docs/00-QUICKSTART.md)** - Get up and running
- **[Architecture](docs/10-ARCHITECTURE/)** - System design & decisions
- **[API Docs](docs/20-API/)** - API reference
- **[Deployment](docs/30-DEPLOYMENT/)** - Production setup
- **[Security](docs/40-SECURITY/)** - Security practices

---

## 🛣️ Roadmap

- [x] Core AI Agent framework
- [x] Solana devnet integration
- [x] SIWS authentication
- [x] Proof-of-Skill NFTs
- [ ] Solana mainnet migration
- [ ] Compressed NFTs (ZK)
- [ ] Mobile app
- [ ] Token launch ($MFAI)

See [docs/50-PRODUCT/roadmap.md](docs/50-PRODUCT/roadmap.md) for full roadmap.

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [OpenAI](https://openai.com/)
- Blockchain on [Solana](https://solana.com/)
- Database via [PostgreSQL](https://www.postgresql.org/)

---

## 📧 Contact

- **Website**: https://mfai.app
- **Twitter**: [@MoneyFactoryAI](https://twitter.com/MoneyFactoryAI)
- **Email**: hello@moneyfactory.ai

---

<p align="center">
  <strong>🚀 Built with passion by the Money Factory AI team</strong>
</p>
