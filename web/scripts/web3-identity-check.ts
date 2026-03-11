import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Web3 Identity Consistency Check...');

    // 1. Verify Unique Constraints (Logic Check)
    console.log('\n--- 1. Schema Validation ---');
    // We can't easily check postgres internal schema via Prisma Client API directly without raw queries,
    // but we can check for logical duplicates which would indicate a schema failure.

    const allUsers = await prisma.user.findMany({
        select: { id: true, walletAddress: true, email: true, role: true }
    });

    console.log(`✅ Scanned ${allUsers.length} users.`);

    const walletMap = new Map<string, string[]>();

    for (const user of allUsers) {
        if (!user.walletAddress) {
            console.error(`❌ CRITICAL: User ${user.id} has NO walletAddress!`);
            continue;
        }

        // Normalize to handle case sensitivity if DB doesn't
        const w = user.walletAddress.toLowerCase();
        if (!walletMap.has(w)) {
            walletMap.set(w, []);
        }
        walletMap.get(w)?.push(user.id);
    }

    // 2. Report Duplicates
    console.log('\n--- 2. Duplicate Detection ---');
    let dupCount = 0;
    for (const [wallet, ids] of walletMap.entries()) {
        if (ids.length > 1) {
            console.error(`🚨 DUPLICATE WALLET FOUND: ${wallet} used by User IDs: ${ids.join(', ')}`);
            dupCount++;
        }
    }

    if (dupCount === 0) {
        console.log('✅ No duplicate wallet assignments found.');
    } else {
        console.error(`❌ Found ${dupCount} duplicate wallet assignments.`);
    }

    // 3. Role Audit
    console.log('\n--- 3. Role Audit ---');
    const founders = allUsers.filter(u => u.role === 'FOUNDER');
    const investors = allUsers.filter(u => u.role === 'INVESTOR');
    console.log(`Founders: ${founders.length}`);
    console.log(`Investors: ${investors.length}`);

    console.log('\n🏁 Check Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
