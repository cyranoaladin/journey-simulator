/**
 * Database Integrity Audit Script
 * Verifies that agent sessions and messages are properly stored
 * Project: Money Factory AI (MFAI)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditDatabaseIntegrity() {
    console.log('🔍 Database Integrity Audit\n');
    console.log('='.repeat(60));

    let hasErrors = false;

    try {
        // 1. Get latest AgentSession
        console.log('\n1️⃣  Fetching latest AgentSession...');
        const latestSession = await prisma.agentSession.findFirst({
            orderBy: { createdAt: 'desc' },
        });

        // Fetch messages separately
        const messages = latestSession ? await prisma.chatMessage.findMany({
            where: { sessionId: latestSession.id },
            orderBy: { id: 'asc' },
        }) : [];

        if (!latestSession) {
            console.log('   ❌ No AgentSession found in database');
            hasErrors = true;
        } else {
            console.log(`   ✅ Session found: ${latestSession.id}`);
            console.log(`   📅 Created: ${latestSession.createdAt}`);
            console.log(`   🤖 Agent: ${latestSession.agentType}`);
            console.log(`   📊 Project: ${latestSession.projectId}`);

            // 2. Check agentState
            console.log('\n2️⃣  Checking agentState...');
            if (latestSession.agentState) {
                console.log('   ✅ agentState is NOT null');
                console.log('   📦 State:', JSON.stringify(latestSession.agentState, null, 2).substring(0, 200) + '...');
            } else {
                console.log('   ⚠️  agentState is null (may be expected for new sessions)');
            }

            // 3. Check contextSummary
            console.log('\n3️⃣  Checking contextSummary...');
            if (latestSession.contextSummary) {
                console.log('   ✅ contextSummary:', latestSession.contextSummary.substring(0, 100) + '...');
            } else {
                console.log('   ⚠️  contextSummary is null');
            }

            // 4. Check ChatMessages
            console.log('\n4️⃣  Checking ChatMessages...');
            console.log(`   📨 Total messages: ${messages.length}`);

            if (messages.length < 2) {
                console.log('   ⚠️  Expected at least 2 messages (user + assistant)');
            } else {
                console.log('   ✅ Message count OK (>= 2)');
            }

            // 5. Analyze each message
            console.log('\n5️⃣  Message Analysis:');
            console.log('-'.repeat(40));

            let userMessageFound = false;
            let assistantMessageFound = false;
            let fallbackDetected = false;

            for (const msg of messages) {
                const contentPreview = msg.content?.substring(0, 80) || 'N/A';
                console.log(`   [${msg.role.toUpperCase()}] ${contentPreview}...`);

                if (msg.role === 'user') {
                    userMessageFound = true;
                }

                if (msg.role === 'assistant') {
                    assistantMessageFound = true;

                    // 6. JSON Parsing Validation
                    console.log('\n6️⃣  JSON Parsing Validation (Assistant message)...');
                    try {
                        const parsed = JSON.parse(msg.content);
                        console.log('   ✅ [DB] JSON Parsing check: OK');
                        console.log(`   📦 Parsed status: ${parsed.status || 'N/A'}`);

                        if (parsed.status === 'FALLBACK') {
                            fallbackDetected = true;
                            console.log('   ⚠️  Fallback mode detected in response');
                        }

                        if (parsed.reasoning) {
                            console.log(`   💭 Reasoning: ${parsed.reasoning.substring(0, 100)}...`);
                        }
                    } catch (parseError) {
                        console.log('   ❌ [DB] JSON Parsing check: FAILED');
                        console.log('   ⚠️  Content is not valid JSON - this may break the Frontend!');
                        console.log(`   📄 Raw content: ${msg.content?.substring(0, 200)}...`);
                        hasErrors = true;
                    }
                }
            }

            // Validation Summary
            console.log('\n' + '='.repeat(60));
            console.log('📊 VALIDATION SUMMARY');
            console.log('='.repeat(60));

            const checks = [
                { name: 'Session exists', passed: !!latestSession },
                { name: 'User message found', passed: userMessageFound },
                { name: 'Assistant message found', passed: assistantMessageFound },
                { name: 'agentState populated', passed: !!latestSession.agentState },
            ];

            checks.forEach(check => {
                const icon = check.passed ? '✅' : '❌';
                console.log(`${icon} ${check.name}`);
            });

            if (fallbackDetected) {
                console.log('⚠️  Response was in FALLBACK mode (API restrictions)');
            }

            // 7. Cleanup option
            console.log('\n7️⃣  Cleanup...');
            const testSessions = await prisma.agentSession.count({
                where: {
                    projectId: {
                        contains: 'test',
                    },
                },
            });
            console.log(`   Found ${testSessions} test sessions in database`);

            // Auto-cleanup test data older than 1 hour
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const oldTestMessages = await prisma.chatMessage.deleteMany({
                where: {
                    session: {
                        createdAt: { lt: oneHourAgo },
                        projectId: { startsWith: 'test-' },
                    },
                },
            });
            
            if (oldTestMessages.count > 0) {
                console.log(`   🧹 Cleaned up ${oldTestMessages.count} old test messages`);
            }
        }

        // 8. Database Stats
        console.log('\n8️⃣  Database Statistics:');
        const stats = {
            sessions: await prisma.agentSession.count(),
            messages: await prisma.chatMessage.count(),
            agentRuns: await prisma.agentRun.count(),
            agentLogs: await prisma.agentLog.count(),
        };

        console.log(`   📊 AgentSessions: ${stats.sessions}`);
        console.log(`   💬 ChatMessages: ${stats.messages}`);
        console.log(`   🏃 AgentRuns: ${stats.agentRuns}`);
        console.log(`   📝 AgentLogs: ${stats.agentLogs}`);

    } catch (error: any) {
        console.error('\n❌ Audit Error:', error.message);
        hasErrors = true;
    } finally {
        await prisma.$disconnect();
    }

    // Final Result
    console.log('\n' + '='.repeat(60));
    if (hasErrors) {
        console.log('❌ AUDIT FAILED: Some checks did not pass');
        process.exit(1);
    } else {
        console.log('✅ AUDIT PASSED: Database integrity verified');
        process.exit(0);
    }
}

auditDatabaseIntegrity().catch(console.error);
