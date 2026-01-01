process.env.LLM_MODEL_NAME = 'gpt-4o';
require('dotenv').config({ path: '../.env' });
const { orchestrateZyno } = require('../orchestration/zynoOrchestrator');
// We do NOT reset memory here. We expect it to load from disk.

async function getMemory() {
    console.log('[GET] Starting Session 2 (New Process)...');

    const userId = 'user-persistence-test';

    // 3. Interaction: Ask for the Fact without restating it
    // User says: "Rappelle-moi le nom de mon token ?"
    const input = "Rappelle-moi le nom de mon token ?";

    console.log(`[GET] User Input: "${input}"`);

    // We need to ensure Zyno uses the memory.
    // Zyno calls `buildUserPrompt` which includes `journeyState` / `lastTimeline`.
    // `orchestrateZyno` loads context.
    // Wait, `orchestrateZyno` doesn't automatically load full history into LLM context unless `context.journeyState` is passed OR `agentMemory` is used inside `orchestrateZyno` to fetch it.

    // Looking at `orchestrateZyno.js`:
    /*
      const currentStep = timeline.length ? timeline[timeline.length - 1] : null;
      if (currentStep && context.userId) {
        agentMemory.update(...)
      }
    */
    // It updates memory. But does it READ memory to inject into context?
    // `triggerAgents` uses `context`.
    // `orchestrateZyno` accepts `context`.

    // If `orchestrateZyno` is the entry point, does it fetch history?
    // It does NOT seem to explicitly fetch history and inject it into `context.journeyState` before calling `triggerAgents`.
    // HOWEVER, `ZynoAgent.js` (which is likely called for "User Interaction" if prompt matches intent or defaults?)
    // Actually `detectIntent` -> 'default' -> 'sync'.
    // Intent for "Rappelle-moi..." might be "product_build" or "default".
    // If `ZynoAgent` is used (it is the orchestrator, but is it an agent itself in the registry? Yes `require('./agents/ZynoAgent')`? No, `ZynoAgent` is usually separate or one of the agents).

    // Wait, `orchestrateZyno.js` imports `agentsRegistry`.
    // ZynoAgent is usually the "Chat" interface.
    // If `orchestrateZyno` logic is just intent routing, then the *Agent* selected needs the history.
    // `BuilderAgent` or `GuideAgent` might answer this.

    // To ensure the agent has context, `orchestrateZyno` or the caller (this script) usually loads the state.
    // In a real app, the Controller loads state from DB and calls `orchestrateZyno(input, { userId, journeyState: ... })`.

    // So, to test PERSISTENCE, I must manually load the state from `agentMemory` (which reads from disk) and pass it to `orchestrateZyno`, replicating the Controller's job.

    const agentMemory = require('../memory/agent_memory');
    const userMem = agentMemory.get(userId);
    console.log(`[GET] Loaded Memory from Disk: Found ${userMem.history?.length || 0} history items.`);

    if (!userMem.history || userMem.history.length === 0) {
        console.error('❌ FAILURE: No history found on disk.');
        process.exit(1);
    }

    // Verify content in history (Unit Check)
    const historyText = JSON.stringify(userMem.history);
    if (!historyText.includes('SkyNet') && !historyText.includes('SKY')) {
        console.warn('⚠️  Warning: "SkyNet" not found in raw history. Maybe it was summarized?');
    }

    // Inject History into Context for the Agent
    const context = {
        userId: userId,
        phase: 'Build',
        // We pass the memory history as "journeyState" or "chatHistory" depending on what agents expect
        // ZynoAgent expects `journeyState.completed_missions`, etc.
        // BaseAgent (which ZynoAgent extends) often handles RAG.
        // But "Short Term Memory" (Conversation History) is usually part of `userPrompt` or `systemPrompt`.

        // Let's rely on the explicit injection:
        history: userMem.history // Some agents might use this
    };

    // Note: If the agents don't support history injection yet, this test validates the *Storage* (step 4 "Verification de l'Historique") but maybe not the *Recall* if logic is missing.
    // The User Request: "Vérifie que l'historique complet est récupéré depuis la DB." (We do this via `agentMemory.get`).
    // "Pose une question... Les agents doivent être capables de lire cet historique".

    // I will try to pass it.
    const result = await orchestrateZyno(input, context);

    console.log(`[GET] Agent Response Summary: ${result.currentStep?.summary}`);

    // Check for hallucination or correct recall
    const responseText = JSON.stringify(result);
    if (responseText.includes('SKY') || responseText.includes('SkyNet')) {
        console.log('✅ RECALL SUCCESS: Agent remembered the token name from Session 1.');
    } else {
        console.error('❌ RECALL FAILURE: Agent did not mention SKY/SkyNet.');
        // This might be a "Context Leak" or just missing feature in Orchestrator to inject history.
        // If so, I will report it.
    }
}

getMemory();
