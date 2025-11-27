const OpenAI = require("openai");

let openai;

const apiKey = process.env.OPENAI_API_KEY;
console.log('🔑 OPENAI_API_KEY check:', {
  exists: !!apiKey,
  isEmpty: apiKey === '',
  trimmedEmpty: apiKey?.trim() === '',
  value: apiKey ? `${apiKey.substring(0, 10)}...` : 'undefined'
});

if (apiKey && apiKey.trim() !== '') {
  console.log('✅ Using real OpenAI client');
  openai = new OpenAI({
    apiKey: apiKey,
  });
} else {
  // Create a mock client for development when API key is not provided
  console.warn("⚠️  OPENAI_API_KEY is not set or empty, using mock OpenAI client for development");

  openai = {
    beta: {
      chat: {
        completions: {
          parse: async (params) => {
            // Mock response for development
            return {
              choices: [{
                message: {
                  parsed: {
                    metadata: {
                      persona_id: "mock_persona",
                      journey_track: "mock_track",
                      phase_id: params.messages[1].content.includes("build") ? "build" : "learn",
                      language: "en",
                      mode: "discovery",
                      tone: "pedagogical",
                      title: "Mock Response",
                      summary: "This is a mock response for development purposes."
                    },
                    ui_blocks: [
                      {
                        kind: "text_block",
                        id: "mock_text_1",
                        content: "Mock content for development: " + params.messages[1].content
                      }
                    ],
                    agent_actions: [],
                    next_state: {
                      phase: params.messages[1].content.includes("build") ? "build" : "learn",
                      completed: false,
                      score: 0
                    }
                  },
                  content: "Mock response for development"
                }
              }],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
              },
              id: "mock_completion_id"
            };
          }
        }
      }
    }
  };
}

module.exports = { openai };