# 🔐 Identifiants de Test - Money Factory AI

## Compte de Test Principal

**Email**: `test@moneyfactory.ai`  
**Mot de passe**: `Test123!`

---

## Informations du Compte

- **Nom**: Test User
- **Rôle**: User (standard)
- **Persona**: Entrepreneur
- **Wallet**: TestWallet123

---

## Utilisation

### Connexion Web
1. Accédez à `http://localhost:5173/login`
2. Entrez l'email : `test@moneyfactory.ai`
3. Entrez le mot de passe : `Test123!`
4. Cliquez sur "Sign In"

### Test API (cURL)
```bash
# Login
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@moneyfactory.ai",
    "password": "Test123!"
  }'
```

---

## Parcours Disponibles via Deep Linking

Une fois connecté, vous pouvez accéder directement aux parcours :

- **Cognitive Activation Hub**: `http://localhost:5173/journeys/cognitive-activation-hub`
- **Capital Foundry**: `http://localhost:5173/journeys/capital-foundry`
- **System Architect**: `http://localhost:5173/journeys/system-architect`
- **Experience Studio**: `http://localhost:5173/journeys/experience-studio`
- **Impact Engine**: `http://localhost:5173/journeys/impact-engine`
- **Resilience Master**: `http://localhost:5173/journeys/resilience-master`

---

## Mode Démo

Pour charger un état de démo pré-configuré :

1. Connectez-vous avec le compte de test
2. Accédez à `/journeys`
3. Cliquez sur "Load Demo State" sur une carte de persona
4. Le système chargera un état de progression avancé

---

## Notes de Sécurité

⚠️ **Environnement de Développement Uniquement**

Ces identifiants sont pour les tests locaux uniquement. Ne les utilisez jamais en production.

---

**Date de création**: 2025-11-21  
**Environnement**: Localhost (Dev)
