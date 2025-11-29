# 🔒 Security Policy - Money Factory AI

## Overview

This document outlines the security policies and best practices for Money Factory AI - Journey Simulator, covering key management, Web3 security, and operational security.

---

## 🔑 Key Management Policy

### General Principles

1. **Never commit secrets to Git**
   - All `.env` files are gitignored
   - Only `.env.example` files with placeholder values are committed
   - If a secret is accidentally committed, immediately:
     - Rotate the compromised key
     - Use `git filter-repo` or BFG to clean history
     - Notify the team

2. **Separation of Environments**
   - Development: Use test/dev keys only
   - Staging: Use staging-specific keys
   - Production: Use production keys with strict access control

3. **Key Rotation**
   - All keys must be rotatable without code changes
   - Document rotation procedures for each key type
   - Rotate keys immediately if:
     - A team member leaves
     - A key is suspected of being compromised
     - As part of regular security audits (quarterly)

---

## 🗝️ Key Types & Management

### API Keys

#### OpenAI API Key (`OPENAI_API_KEY`)
- **Location**: Backend only (`mf-back/.env`)
- **Never expose**: Do not log, do not send to frontend
- **Rotation**: Via OpenAI dashboard
- **Monitoring**: Track usage via OpenAI dashboard

#### RAG API Key (`RAG_API_KEY`)
- **Location**: Backend only
- **Purpose**: Access to RAG search service
- **Rotation**: Coordinate with RAG service admin

### Database Credentials

#### MongoDB (`MONGO_URI`)
- **Format**: `mongodb://user:password@host:port/database`
- **Storage**: Backend `.env` only
- **Rotation**: Update password in MongoDB + update `.env`
- **Backup**: Ensure backups use separate credentials

#### PostgreSQL (`DATABASE_URL` for Prisma)
- **Format**: `postgresql://user:password@host:port/database`
- **Storage**: `web/.env` only
- **Rotation**: Update via database admin tools

### Authentication Secrets

#### JWT Secret (`JWT_SECRET`)
- **Purpose**: Sign/verify JWT tokens
- **Requirements**: 
  - Minimum 32 characters
  - Cryptographically random
  - Different for dev/staging/prod
- **Rotation**: 
  - Invalidates all existing tokens
  - Plan rotation during low-traffic periods
  - Implement grace period if possible

#### Admin API Key (`ADMIN_API_KEY`)
- **Purpose**: Protect admin endpoints
- **Usage**: Internal tools only
- **Logging**: Log all admin operations with this key

---

## 🌐 Web3 Security

### Wallet Key Management

#### **CRITICAL RULES**

1. **Never store private keys in:**
   - Frontend code
   - Git repositories
   - Logs
   - Database (unless encrypted with HSM)
   - Environment variables exposed to client (`NEXT_PUBLIC_*`)

2. **Hot Wallet (if needed)**
   - Purpose: Automated operations (minting, airdrops)
   - Storage: 
     - Production: Hardware Security Module (HSM) or cloud KMS
     - Development: Server-side `.env` only
   - Access: Restricted to specific server processes
   - Monitoring: Alert on all transactions

3. **User Wallets**
   - Users always control their own keys
   - Use `@solana/wallet-adapter` for all wallet interactions
   - Never request private keys from users
   - All transactions must be signed by user's wallet

### Solana RPC Endpoints

#### Public RPC (`NEXT_PUBLIC_SOLANA_RPC_URL`)
- Can be exposed to frontend
- Use rate-limited public endpoints or paid RPC services
- Monitor for abuse

#### Private RPC (`SOLANA_RPC_URL`)
- Backend only
- Use authenticated endpoints if available
- Higher rate limits for backend operations

### Smart Contract Security

1. **Audit all contracts** before mainnet deployment
2. **Use established libraries**: Metaplex, Anchor, etc.
3. **Test on devnet** extensively before mainnet
4. **Implement circuit breakers** for critical operations

---

## 🛡️ Operational Security

### Access Control

1. **Principle of Least Privilege**
   - Grant minimum necessary permissions
   - Regular access reviews
   - Revoke access immediately when no longer needed

2. **Multi-Factor Authentication (MFA)**
   - Required for all production access
   - Required for GitHub, cloud providers, databases

3. **IP Whitelisting**
   - Restrict admin endpoints to known IPs
   - Use VPN for remote access

### Logging & Monitoring

1. **What to Log**
   - All authentication attempts
   - All admin operations
   - All blockchain transactions
   - All LLM API calls (without sensitive data)
   - All errors and exceptions

2. **What NOT to Log**
   - API keys
   - Private keys
   - User passwords
   - JWT tokens
   - Full request bodies containing secrets

3. **Log Retention**
   - Security logs: 1 year minimum
   - Application logs: 90 days
   - Audit logs: Indefinite

### Incident Response

1. **Detection**
   - Monitor for unusual API usage
   - Alert on failed authentication attempts
   - Track blockchain transaction anomalies

2. **Response Plan**
   - Identify the scope of the incident
   - Rotate compromised keys immediately
   - Notify affected users if necessary
   - Document the incident and response

3. **Post-Incident**
   - Conduct root cause analysis
   - Update security policies
   - Implement preventive measures

---

## 📋 Security Checklist

### Before Deployment

- [ ] All secrets in `.env` files (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] `.env.example` files have no real secrets
- [ ] Git history checked for leaked secrets
- [ ] All production keys rotated
- [ ] MFA enabled for all team members
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested

### Regular Audits (Quarterly)

- [ ] Review access permissions
- [ ] Rotate sensitive keys
- [ ] Review logs for anomalies
- [ ] Update dependencies
- [ ] Security scan of codebase
- [ ] Penetration testing (if applicable)

---

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** open a public GitHub issue
2. Email: security@mfai.app (or designated security contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will respond within 48 hours and work with you to resolve the issue.

---

## 📚 References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Solana Security Best Practices](https://docs.solana.com/developing/programming-model/security)
- [OpenAI API Security](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Last Updated**: 2025-11-29  
**Version**: 1.0  
**Owner**: Security Team
