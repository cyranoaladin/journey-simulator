<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Plan de validation (local + CI)

Automatisé
- Lint: npm run lint (web/)
- Build: npm run build (web/)
- Tests unitaires: npm run test:unit
- E2E: npm run e2e:install (1ère fois), npm run test:e2e
- Vérification complète: npm run verify

Manuel (avant push)
1) web/: npm run build
2) web/: npm run dev (port 3000)
3) Vérifier console: aucune erreur critique
4) Parcours: Wallet → Journey step (DEMO_MODE) → Submit → Feedback → Mint simulate (→ execute si clé)
5) Observabilité: /api/healthz, /api/metrics; pages admin si configurées

Couverture backend
- Collecte via Jest (report JSON/LCOV). Gate CI conseillé à ≥85% pour app/api/** et src/server/**.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
