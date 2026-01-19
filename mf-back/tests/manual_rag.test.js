/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const BaseAgent = require("../agents/BaseAgent");
const { callGpt5 } = require("../utils/openaiClient");

jest.mock("../utils/agent-idempotence", () => ({
    findOrCreateAgentRun: jest.fn().mockResolvedValue({ run: { status: 'started', save: jest.fn().mockResolvedValue(true) }, isNew: true }),
    generateIdempotencyKey: jest.fn().mockReturnValue('mock-key')
}));

// Mock callGpt5 to avoid actual API calls
jest.mock("../utils/openaiClient", () => ({
    callGpt5: jest.fn().mockImplementation(async ({ messages }) => {
        return {
            message: {
                content: "Mock response",
            },
        };
    }),
    DEFAULT_LLM_MODEL: "gpt-mock",
    DEFAULT_LLM_TEMPERATURE: 0,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS: 100,
}));

class TestAgent extends BaseAgent {
    constructor() {
        super("TestAgent");
    }

    buildSystemPrompt(ctx) {
        return "System Prompt Base";
    }

    buildUserPrompt(ctx) {
        return "User Prompt Base";
    }
}

describe("BaseAgent RAG Integration", () => {
    let agent;
    let ctx;

    beforeEach(() => {
        agent = new TestAgent();
        ctx = {
            userId: "test-user",
            journeyId: "test-journey",
            phaseId: "test-phase",
            trackId: "test-track",
            submission: "Qu'est-ce que le Proof of History ?",
        };
        jest.clearAllMocks();
    });

    test("should inject RAG context into system prompt", async () => {
        console.log("--- Starting RAG Integration Test ---");

        // Mock retrieveRagContext to return fake context
        jest.spyOn(agent, 'retrieveRagContext').mockResolvedValue({
            context: "Fake RAG Content for Testing",
            hits: [{ title: 'mock', content: 'Fake RAG Content for Testing' }]
        });

        await agent.run(ctx);

        const lastCall = callGpt5.mock.calls[0][0];
        const systemMessage = lastCall.messages.find(m => m.role === "system").content;

        console.log("\n--- Generated System Prompt ---");
        console.log(systemMessage);

        expect(systemMessage).toContain("--- RAG CONTEXT ---");
        expect(systemMessage).toContain("You are an expert. Use EXCLUSIVELY the context above");
    });
});
