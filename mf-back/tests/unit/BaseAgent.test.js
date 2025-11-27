const BaseAgent = require("../../agents/BaseAgent");
const axios = require("axios");
const { callGpt5 } = require("../../utils/openaiClient");

// Mock dependencies
jest.mock("axios");
jest.mock("../../utils/openaiClient", () => ({
    callGpt5: jest.fn().mockResolvedValue({
        message: { content: "Mock LLM Response" }
    }),
    DEFAULT_LLM_MODEL: "gpt-mock",
    DEFAULT_LLM_TEMPERATURE: 0,
    DEFAULT_LLM_MAX_OUTPUT_TOKENS: 100,
}));

// Test Subclass for Domain Override
class EducationAgent extends BaseAgent {
    getRagDomain(ctx) {
        return "education";
    }
    buildSystemPrompt() { return "Sys"; }
    buildUserPrompt() { return "User"; }
}

// Concrete implementation for testing BaseAgent
class TestAgent extends BaseAgent {
    buildSystemPrompt() { return "Sys"; }
    buildUserPrompt() { return "User"; }
}

describe("BaseAgent RAG Integration (Unit)", () => {
    let agent;
    let ctx;

    beforeEach(() => {
        agent = new TestAgent("TestAgent");
        ctx = {
            userId: "user-1",
            submission: "What is Solana?",
        };
        jest.clearAllMocks();
    });

    // Scenario A: Success
    test("Scenario A: Should successfully retrieve and inject RAG context", async () => {
        const mockHits = [
            { document: "Solana is a blockchain." },
            { document: "It uses Proof of History." }
        ];

        axios.post.mockResolvedValue({
            data: { hits: mockHits }
        });

        await agent.run(ctx);

        // Verify Axios Call
        expect(axios.post).toHaveBeenCalledWith(
            "https://rag-api.nexusreussite.academy/rag/query",
            expect.objectContaining({
                query: "What is Solana?",
                filters: { domain: "mfai_web3" } // Default domain
            }),
            expect.any(Object)
        );

        // Verify Context Injection
        const lastCall = callGpt5.mock.calls[0][0];
        const systemMsg = lastCall.messages.find(m => m.role === "system").content;

        expect(systemMsg).toContain("--- RAG CONTEXT ---");
        expect(systemMsg).toContain("Solana is a blockchain.");
        expect(systemMsg).toContain("It uses Proof of History.");
    });

    // Scenario B: Critical Failure (Relaxed)
    test("Scenario B: Should CONTINUE execution if RAG fails (500/Timeout)", async () => {
        axios.post.mockRejectedValue(new Error("Network Error"));

        // Should NOT throw
        await expect(agent.run(ctx)).resolves.not.toThrow();

        // Ensure LLM WAS called (fallback mode)
        expect(callGpt5).toHaveBeenCalled();
    });

    // Scenario C: Domain Filters
    test("Scenario C: Should use correct domain for subclasses", async () => {
        const eduAgent = new EducationAgent("EduAgent");

        axios.post.mockResolvedValue({ data: { hits: [] } });

        await eduAgent.run(ctx);

        expect(axios.post).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                filters: { domain: "education" }
            }),
            expect.any(Object)
        );
    });
});
