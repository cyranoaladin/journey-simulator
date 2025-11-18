import { PrismaClient } from '@prisma/client'

/**
 * Reset demo data:
 * - deletes AgentLog for userId='demo_user'
 * - deletes MintLog for userId='demo_user'
 * - optionally clears JourneyState.last_state for a given journeyId
 *
 * Usage:
 *   npm run reset:demo            # delete logs/mints for demo_user
 *   npm run reset:demo -- --journeyId=<ID>  # also clears JourneyState for this journey
 */
async function main(){
  const prisma = new PrismaClient()
  const args = process.argv.slice(2)
  const journeyIdArg = args.find(a => a.startsWith('--journeyId='))
  const journeyId = journeyIdArg ? journeyIdArg.split('=')[1] : undefined

  const delAgent = await prisma.agentLog.deleteMany({ where: { userId: 'demo_user' } })
  const delMint = await prisma.mintLog.deleteMany({ where: { userId: 'demo_user' } })

  let cleared = 0
  if (journeyId){
    const upd = await prisma.journeyState.updateMany({ where: { journeyId }, data: { last_state: {}, last_metadata: {} } })
    cleared = upd.count
  }

  console.log(JSON.stringify({ deletedAgentLogs: delAgent.count, deletedMintLogs: delMint.count, clearedJourneyStates: cleared }, null, 2))
  await prisma.$disconnect()
}

main().catch(e=>{ console.error(e); process.exit(1) })