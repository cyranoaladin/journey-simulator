#!/usr/bin/env node
const { execSync } = require('node:child_process')

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/mfai?schema=public'
}

try {
  execSync('npx prisma generate', { stdio: 'inherit' })
} catch (error) {
  console.error('[prisma] generate failed', error)
  process.exit(error?.status ?? 1)
}
