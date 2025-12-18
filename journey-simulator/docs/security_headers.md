# Sécurité (Frontend) — Headers recommandés

Ce document complète la **CSP injectée via Vite** (voir `vite.config.ts`) et propose un set de headers “safe-by-default” pour Nginx.

## CSP côté build (Vite)

Le projet injecte une balise:

- `Content-Security-Policy` (via `<meta http-equiv="Content-Security-Policy" ...>`)

Notes importantes:

- La CSP inclut actuellement **`'unsafe-inline'`** pour `script-src` car le projet injecte des polyfills en inline (et `index.html` contient un script inline).
- Pour une CSP plus stricte, il faudra **externaliser** ces scripts ou passer à une stratégie **nonce/hash** côté headers serveur.

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
- Une CSP **en header** est préférable à une CSP via meta (priorité + report-only), mais la meta permet un baseline “portable”.
