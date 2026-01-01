# Instructions de Déploiement - Journey MFAI

## Prérequis sur le Serveur

Le script vérifie automatiquement la présence de :
- Docker (v24+)
- Docker Compose (v2)
- Nginx
- Certbot (python3-certbot-nginx)
- Git

## Déploiement en Une Commande

### 1. Transférer le script sur le serveur

```bash
# Sur votre machine locale
scp deploy.sh user@votre-serveur:/tmp/deploy.sh
```

### 2. Exécuter le script sur le serveur

```bash
# Sur le serveur
sudo bash /tmp/deploy.sh
```

Le script vous demandera :
1. **GitHub Personal Access Token (PAT)** - Pour cloner le repository privé
2. **OpenAI API Key** - Votre clé OpenAI privée (ne pas la commiter)
3. **Admin API Key** - Appuyez sur Entrée pour en générer une automatiquement

## Ce que fait le script automatiquement

1. ✅ Vérifie tous les prérequis
2. ✅ Clone le repository depuis GitHub (branche `main`)
3. ✅ Configure les variables d'environnement (`.deploy.env`)
4. ✅ Construit et démarre les conteneurs Docker
5. ✅ Configure Nginx avec reverse proxy
6. ✅ Installe le certificat SSL Let's Encrypt
7. ✅ Affiche un résumé complet du déploiement

## Architecture Déployée

### Conteneurs Docker
- `mfai-api` - Backend Express (port 3002)
- `mfai-web` - Frontend React (port 3003)
- `mfai-mongo` - MongoDB (port 27017 interne)
- `mfai-postgres` - PostgreSQL (port 5433 → 5432)

### Isolation avec le RAG existant
Le script évite tous les ports utilisés par le RAG :
- RAG API : 8001 ❌ (non utilisé)
- RAG UI : 18501 ❌ (non utilisé)
- ChromaDB : 8000 ❌ (non utilisé)
- Ollama : 11434 ❌ (non utilisé)

## Après le Déploiement

### Vérifier le statut
```bash
cd /srv/journey-mfai
docker compose -f docker-compose.deploy.yml ps
```

### Voir les logs
```bash
docker compose -f docker-compose.deploy.yml logs -f
```

### Redémarrer les services
```bash
docker compose -f docker-compose.deploy.yml restart
```

### Arrêter les services
```bash
docker compose -f docker-compose.deploy.yml down
```

## Mise à Jour du Déploiement

Pour déployer une nouvelle version :

```bash
cd /srv/journey-mfai
git pull origin main
docker compose -f docker-compose.deploy.yml up -d --build
```

## Dépannage

### Les conteneurs ne démarrent pas
```bash
docker compose -f /srv/journey-mfai/docker-compose.deploy.yml logs
```

### Nginx ne démarre pas
```bash
nginx -t
systemctl status nginx
```

### Certificat SSL non créé
```bash
certbot certificates
certbot --nginx -d journey.mfai.app
```

## Sécurité

- ✅ Toutes les clés sensibles sont dans `.deploy.env` (chmod 600)
- ✅ Communication HTTPS forcée via Nginx
- ✅ Headers de sécurité configurés
- ✅ Isolation réseau Docker
- ✅ Admin API Key générée aléatoirement

## Support

En cas de problème, vérifiez :
1. Les logs Docker : `docker compose logs`
2. Les logs Nginx : `/var/log/nginx/journey.mfai.app.error.log`
3. L'état des conteneurs : `docker ps -a`
