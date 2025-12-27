# Sécurité & Hardening

- Aucun secret en dur; .env uniquement; HTTPS en prod
- CORS restreint (mêmes origines par défaut)
- CSP stricte (voir web/next.config.mjs)
- Headers sécurité (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- Rate-limit sur endpoints critiques (/api/mint/*)

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
