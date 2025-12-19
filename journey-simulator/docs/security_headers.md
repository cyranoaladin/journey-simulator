# Sécurité (Frontend) — Headers recommandés

Ce document complète la **CSP injectée via Vite** (voir `vite.config.ts`) et propose un set de headers “safe-by-default” pour Nginx.

## CSP côté build (Vite)

Le projet injecte une balise:

- `Content-Security-Policy` (via `<meta http-equiv="Content-Security-Policy" ...>`)

Notes importantes:

- Une CSP **en header** est préférable à une CSP via meta (priorité + report-only).
- Le projet a été durci pour éviter **`unsafe-inline`** côté `script-src` en production (polyfills externalisés).

## Headers Nginx recommandés

Dans un `server {}` Nginx (ou dans `location /`), vous pouvez ajouter:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

Notes:

- **HSTS** (`Strict-Transport-Security`) doit être ajouté uniquement derrière HTTPS.
- **COEP** : `credentialless` est souvent plus simple à adopter que `require-corp`.

## Variante COEP = credentialless (recommandée si compatible)

Objectif: activer l’isolation cross-origin (COOP/COEP) tout en limitant les régressions.

Headers:

```nginx
add_header Cross-Origin-Opener-Policy "same-origin" always;
add_header Cross-Origin-Embedder-Policy "credentialless" always;
add_header Cross-Origin-Resource-Policy "same-site" always;
```

Points d’attention:

- Les ressources cross-origin (fonts Google, images Cloudinary, etc.) doivent être servies avec des headers compatibles (CORS/CORP).
- Si une ressource tierce casse, désactiver temporairement COEP ou basculer sur une stratégie `require-corp` après audit complet.

## CSP prod (exemple allowlist)

Exemple CSP alignée avec:

- `journey.mfai.app`, `mfai.app`
- Cloudinary
- RPC Solana

```nginx
add_header Content-Security-Policy "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'; img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com; font-src 'self' https://fonts.gstatic.com data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; script-src 'self'; connect-src 'self' https://journey.mfai.app https://mfai.app https://api.devnet.solana.com https://api.testnet.solana.com https://api.mainnet-beta.solana.com;" always;
```
