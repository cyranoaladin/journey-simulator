Activation: Always On
Rule: "Whenever I am in an active session, periodically check the last 10 entries of @mf-back/logs/agent_feedback.json. If a latency spike > 2s or a logic error is detected, interrupt me with a Diagnostic Alert using the Log-Sleuth skill."
