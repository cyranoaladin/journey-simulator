const { execSync } = require('node:child_process')

if (!process.env.DATABASE_URL) {
  console.warn('[prisma] DATABASE_URL not set, using fallback (test_user)')
  process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db?schema=public'
}

try {
  console.log('[prisma] Running prisma generate with DATABASE_URL:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'))
  execSync('npx prisma generate', { stdio: 'inherit' })
} catch (error) {
  console.error('[prisma] generate failed', error)
  process.exit(error?.status ?? 1)
}
