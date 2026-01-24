# Server Deployment Guide

## Overview
Money Factory AI Backend Deployment Documentation

## Prerequisites
- Node.js v18.19.1+
- PostgreSQL 14+
- Redis (optional, for caching)

## Environment Variables
See `.env.example` for required configuration.

## Deployment Steps
1. Install dependencies: `npm install`
2. Build backend: `cd mf-back && npm run build`
3. Run migrations: `npx prisma migrate deploy`
4. Start server: `npm start`

## Production Considerations
- Use process manager (PM2, systemd)
- Configure reverse proxy (nginx)
- Enable HTTPS
- Set up monitoring

## TODO
- Add detailed deployment procedures
- Document infrastructure requirements
- Add rollback procedures
