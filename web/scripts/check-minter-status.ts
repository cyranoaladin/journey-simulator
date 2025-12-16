import prisma from '../src/lib/prisma'

async function main() {
  const last = await prisma.mintLog.findFirst({ orderBy: { createdAt: 'desc' } })
  if (!last) {
    console.log('No mint logs found.')
    return
  }
  console.log({
    createdAt: last.createdAt,
    status: last.status,
    network: last.network,
    signature: last.signature,
    mintAddress: last.mintAddress,
    error: last.error,
  })
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


