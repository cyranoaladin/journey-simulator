// 📦 agentFeedbackLog.js — Modèle Mongoose pour journaliser les exécutions agents
const mongoose = require('mongoose');

const AgentLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  agentName: { type: String, required: true },
  intent: { type: String },
  phaseId: { type: String },
  promptSent: { type: String },
  reasoning: { type: String },
  actionTaken: { type: String },
  response: { type: mongoose.Schema.Types.Mixed },
  output: { type: mongoose.Schema.Types.Mixed },
  sources: [{ type: mongoose.Schema.Types.Mixed }],
  metrics: { type: mongoose.Schema.Types.Mixed },
  feedback: { type: mongoose.Schema.Types.Mixed },
  timelineIndex: { type: Number },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  ragSnippets: [{ type: mongoose.Schema.Types.Mixed }],
  ae_summary: String,
  ae_outcome: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentInteractionLog', AgentLogSchema);

