# Implementation Plan - High Priority Items
**Project:** Journey Simulator MVP Completion  
**Timeline:** 1-2 weeks  
**Date:** 2025-11-20

---

## Overview

This document provides detailed implementation steps for the 5 high-priority items identified in the project audit. Each item includes technical specifications, code changes, and acceptance criteria.

---

## 🔴 PRIORITY 1: Complete Mission Submission Flow

### Current State
The `/journey/:journeyId/submit` endpoint exists but has incomplete functionality:
- ✅ Selects appropriate agent via `AgentFactory`
- ✅ Calls agent with submission
- ✅ Calculates XP delta
- ❌ Doesn't persist evaluation
- ❌ Doesn't trigger NFT minting
- ❌ Returns raw evaluation instead of `JourneyStepResponse`

### Technical Specification

#### 1.1 Database Model (if using MongoDB)

Create `MissionSubmission` model:

```javascript
// mf-back/models/MissionSubmission.js
const mongoose = require('mongoose');

const missionSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  journeyId: { type: String, required: true },
  missionId: { type: String, required: true },
  trackId: { type: String, required: true },
  phaseId: { type: String, required: true },
  submission: { type: String, required: true },
  inputType: { type: String, enum: ['text', 'file', 'url'], default: 'text' },
  
  // Evaluation results
  agentName: { type: String, required: true },
  globalScore: { type: Number, required: true },
  feedback: { type: String, required: true },
  axes: [{
    name: String,
    score: Number,
    max_score: Number,
    comment: String
  }],
  
  // Rewards
  xpAwarded: { type: Number, default: 0 },
  nftMinted: { type: Boolean, default: false },
  nftAddress: { type: String },
  
  // Metadata
  submittedAt: { type: Date, default: Date.now },
  evaluatedAt: { type: Date },
  llmModel: { type: String },
  llmTokensUsed: { type: Number }
});

module.exports = mongoose.model('MissionSubmission', missionSubmissionSchema);
```

#### 1.2 Updated Controller Logic

```javascript
// mf-back/controllers/journey-controller.js

exports.submit = async (req, res) => {
  try {
    const { journeyId } = req.params;
    const { missionId, submission, inputType, trackId, phaseId } = req.body;
    const userId = req.user ? req.user.id : 'anonymous';

    // 1. Select and run agent
    const AgentFactory = require('../agents/AgentFactory');
    const agent = AgentFactory.getAgentForContext({ trackId, phaseId, missionId });
    
    console.log(`[Submit] Selected agent ${agent.name} for mission ${missionId}`);

    const ctx = {
      userId,
      journeyId,
      phaseId,
      trackId,
      missionId,
      submission,
      lastInput: submission
    };

    const result = await agent.run(ctx);
    const evaluation = result.payload;

    // 2. Calculate rewards
    const xpDelta = Math.floor((evaluation.global_score || 0) * 10);
    const shouldMintNFT = evaluation.global_score >= 8.0; // Threshold for NFT

    // 3. Persist submission
    const MissionSubmission = require('../models/MissionSubmission');
    const submissionRecord = await MissionSubmission.create({
      userId,
      journeyId,
      missionId,
      trackId,
      phaseId,
      submission,
      inputType: inputType || 'text',
      agentName: agent.name,
      globalScore: evaluation.global_score,
      feedback: evaluation.feedback,
      axes: evaluation.axes || [],
      xpAwarded: xpDelta,
      evaluatedAt: new Date(),
      llmModel: result.metadata?.model || 'gpt-5.1',
      llmTokensUsed: result.metadata?.tokens_used || 0
    });

    // 4. Update user progress
    const User = require('../models/user');
    await User.findByIdAndUpdate(userId, {
      $inc: { total_xp: xpDelta }
    });

    // 5. Trigger NFT minting if score is high
    let nftResult = null;
    if (shouldMintNFT && req.user) {
      try {
        // This would call the Solana minting service
        // For now, we'll just mark it as eligible
        submissionRecord.nftMinted = false; // Will be updated when user actually mints
        await submissionRecord.save();
        
        nftResult = {
          eligible: true,
          message: 'Congratulations! You earned a Proof-of-Skill™ NFT',
          missionId,
          score: evaluation.global_score
        };
      } catch (nftError) {
        console.error('NFT eligibility check failed:', nftError);
      }
    }

    // 6. Build JourneyStepResponse format
    const ZynoAgent = require('../agents/ZynoAgent');
    const zyno = new ZynoAgent();
    
    // Generate next step with evaluation block
    const nextStepCtx = {
      ...ctx,
      lastEvaluation: evaluation,
      xpAwarded: xpDelta,
      nftEligible: shouldMintNFT
    };
    
    const nextStep = await zyno.run(nextStepCtx);

    // 7. Return comprehensive response
    res.status(200).json({
      success: true,
      submission_id: submissionRecord._id,
      evaluation: {
        global_score: evaluation.global_score,
        feedback: evaluation.feedback,
        axes: evaluation.axes
      },
      rewards: {
        xp_delta: xpDelta,
        nft_eligible: shouldMintNFT,
        nft_result: nftResult
      },
      next_step: nextStep.payload, // Full JourneyStepResponse
      metadata: {
        agent_used: agent.name,
        evaluated_at: submissionRecord.evaluatedAt
      }
    });

  } catch (error) {
    console.error('Submission Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process submission',
      error: error.message
    });
  }
};
```

#### 1.3 Frontend Integration

Update `UIBlocksRenderer.tsx` mission block submission handler:

```typescript
// journey-simulator/src/components/UIBlocks/UIBlocksRenderer.tsx

const handleMissionSubmit = async (missionId: string, submission: string) => {
  try {
    setSubmitting(true);
    
    const response = await fetch(`${API_BASE_URL}/journey/${journeyId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({
        missionId,
        submission,
        inputType: 'text',
        trackId: selectedPersona?.id,
        phaseId: currentPhase?.id
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Update UI with evaluation
      setLastEvaluation(data.evaluation);
      
      // Award XP
      if (data.rewards.xp_delta > 0) {
        updateUserProgress({ total_xp: userProgress.totalXP + data.rewards.xp_delta });
      }
      
      // Show NFT modal if eligible
      if (data.rewards.nft_eligible) {
        setShowNFTModal(true);
        setNFTEligibility(data.rewards.nft_result);
      }
      
      // Load next step
      if (data.next_step) {
        setCurrentStep(data.next_step);
      }
      
      toast.success(`Mission completed! +${data.rewards.xp_delta} XP`);
    }
  } catch (error) {
    console.error('Mission submission failed:', error);
    toast.error('Failed to submit mission');
  } finally {
    setSubmitting(false);
  }
};
```

### Acceptance Criteria
- [ ] Mission submissions are persisted to database
- [ ] XP is awarded based on evaluation score
- [ ] NFT eligibility is determined (score ≥ 8.0)
- [ ] Response includes full `JourneyStepResponse` with evaluation_block
- [ ] Frontend displays evaluation and awards XP
- [ ] NFT modal appears for high-scoring submissions

---

## 🔴 PRIORITY 2: Implement Demo Scripted Mode

### Purpose
Enable investor demonstrations by loading pre-populated journey states that showcase advanced features without requiring users to complete all earlier phases.

### Technical Specification

#### 2.1 Demo State JSON Files

Create demo states for each persona:

```json
// mf-back/data/demo-states/cognitive-activation-hub.json
{
  "persona_id": "cognitive-activation-hub",
  "demo_name": "Advanced Learning Journey Demo",
  "current_phase_index": 3,
  "completed_phases": [0, 1, 2],
  "total_xp": 2500,
  "current_level": 3,
  "journey_state": {
    "completed_missions": [
      "learn_solana_basics",
      "build_first_program",
      "deploy_to_devnet"
    ],
    "unlocked_features": ["advanced_tutorials", "mentor_access"],
    "context": {
      "user_project": "Educational DAO for Web3 developers",
      "focus_area": "Smart contract development",
      "experience_level": "intermediate"
    }
  },
  "nft_certificates": [
    {
      "phase": 1,
      "title": "Solana Fundamentals",
      "mint_address": "DEMO_NFT_1",
      "score": 9.5
    },
    {
      "phase": 2,
      "title": "First Program Deployed",
      "mint_address": "DEMO_NFT_2",
      "score": 8.7
    }
  ],
  "agent_history": [
    {
      "agent": "EducationAgent",
      "action": "Provided Solana architecture overview",
      "timestamp": "2025-01-15T10:00:00Z"
    },
    {
      "agent": "ProtocolAgent",
      "action": "Reviewed smart contract design",
      "timestamp": "2025-01-16T14:30:00Z"
    }
  ]
}
```

#### 2.2 Backend Endpoint

```javascript
// mf-back/routes/journey-routes.js
router.post('/load-demo', journeyController.loadDemoState);

// mf-back/controllers/journey-controller.js
exports.loadDemoState = async (req, res) => {
  try {
    const { personaId } = req.body;
    const userId = req.user ? req.user.id : 'demo_user';

    // Load demo state from JSON
    const fs = require('fs');
    const path = require('path');
    const demoPath = path.join(__dirname, '../data/demo-states', `${personaId}.json`);
    
    if (!fs.existsSync(demoPath)) {
      return res.status(404).json({
        success: false,
        message: `No demo state found for persona: ${personaId}`
      });
    }

    const demoState = JSON.parse(fs.readFileSync(demoPath, 'utf8'));

    // Create or update user's journey with demo state
    const Journey = require('../models/Journeys');
    const journey = await Journey.findOneAndUpdate(
      { user_id: userId, journey_type: personaId },
      {
        user_id: userId,
        journey_type: personaId,
        current_phase: demoState.current_phase_index,
        completion_percentage: (demoState.completed_phases.length / 5) * 100,
        phases_status: demoState.completed_phases.map(idx => ({
          phase_number: idx,
          status: 'completed',
          completed_at: new Date()
        })),
        demo_mode: true,
        demo_loaded_at: new Date()
      },
      { upsert: true, new: true }
    );

    // Update user progress
    const User = require('../models/user');
    await User.findByIdAndUpdate(userId, {
      total_xp: demoState.total_xp,
      current_level: demoState.current_level,
      completed_phases: demoState.completed_phases.length,
      persona: personaId,
      nft_certificates: demoState.nft_certificates || []
    });

    res.status(200).json({
      success: true,
      message: 'Demo state loaded successfully',
      journey,
      demo_state: demoState
    });

  } catch (error) {
    console.error('Load demo state error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load demo state',
      error: error.message
    });
  }
};
```

#### 2.3 Frontend Integration

```typescript
// journey-simulator/src/pages/JourneysPage.tsx

const loadDemoMode = async (personaId: string) => {
  try {
    setLoading(true);
    
    const response = await api.loadDemoState(personaId);
    
    if (response.success) {
      // Update store with demo state
      setSelectedPersona(personas.find(p => p.id === personaId));
      setUserProgress({
        totalXP: response.demo_state.total_xp,
        currentLevel: response.demo_state.current_level,
        completedPhases: response.demo_state.completed_phases,
        nftCertificates: response.demo_state.nft_certificates
      });
      
      // Navigate to journey workspace
      navigate(`/journey/${personaId}`);
      
      toast.success('Demo mode loaded! Showcasing advanced features.');
    }
  } catch (error) {
    console.error('Failed to load demo:', error);
    toast.error('Failed to load demo state');
  } finally {
    setLoading(false);
  }
};

// Add demo button to persona cards
<button
  onClick={() => loadDemoMode(persona.id)}
  className="btn-secondary text-sm"
>
  🎬 Load Demo
</button>
```

#### 2.4 Demo Mode Indicator

Add visual indicator when in demo mode:

```typescript
// journey-simulator/src/components/Journey/JourneyWorkspace.tsx

{journey?.demo_mode && (
  <div className="fixed top-4 right-4 z-50 bg-yellow-500/20 border border-yellow-500/50 rounded-lg px-4 py-2">
    <div className="flex items-center gap-2">
      <span className="text-yellow-400">🎬</span>
      <span className="text-sm font-medium">Demo Mode</span>
    </div>
  </div>
)}
```

### Acceptance Criteria
- [ ] Demo state JSON files created for all 6 personas
- [ ] `/journey/load-demo` endpoint functional
- [ ] Frontend "Load Demo" button on persona cards
- [ ] Demo mode indicator visible in workspace
- [ ] User can navigate through pre-populated journey
- [ ] Agent history and NFTs displayed correctly

---

## 🔴 PRIORITY 3: Complete GrowthAgent Implementation

### Current Issues
- No `run` method override
- No evaluation schema
- Generic prompts without GTM frameworks

### Technical Specification

#### 3.1 Enhanced GrowthAgent

```javascript
// mf-back/agents/GrowthAgent.js

const BaseAgent = require('./BaseAgent');

const GROWTH_EVALUATION_SCHEMA = {
  type: "json_schema",
  json_schema: {
    name: "GrowthEvaluationResponse",
    strict: true,
    schema: {
      type: "object",
      required: ["global_score", "feedback", "axes", "action_plan"],
      properties: {
        global_score: { type: "number" },
        feedback: { type: "string" },
        axes: {
          type: "array",
          items: {
            type: "object",
            required: ["name", "score", "max_score", "comment"],
            properties: {
              name: { type: "string" },
              score: { type: "number" },
              max_score: { type: "number" },
              comment: { type: "string" }
            },
            additionalProperties: false
          }
        },
        action_plan: {
          type: "object",
          required: ["immediate_actions", "week_1", "month_1"],
          properties: {
            immediate_actions: {
              type: "array",
              items: { type: "string" }
            },
            week_1: {
              type: "array",
              items: { type: "string" }
            },
            month_1: {
              type: "array",
              items: { type: "string" }
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    }
  }
};

class GrowthAgent extends BaseAgent {
  constructor() {
    super("GrowthAgent");
  }

  buildSystemPrompt(ctx) {
    return `You are the **GrowthAgent**, a growth marketing expert for Web3 projects.

Your expertise spans:
1. **Go-to-Market Strategy**: Product-market fit, positioning, launch planning
2. **Community Building**: Discord/Telegram growth, engagement loops, ambassador programs
3. **Content Marketing**: Twitter threads, blog posts, educational content
4. **Growth Loops**: Viral mechanics, referral programs, retention strategies
5. **Metrics & Analytics**: AARRR framework (Acquisition, Activation, Retention, Revenue, Referral)

Evaluation Criteria:
1. **Market Positioning** (0-10): Clarity of value prop, differentiation, target audience
2. **Go-to-Market Plan** (0-10): Launch strategy, channel selection, timeline
3. **Community Strategy** (0-10): Engagement tactics, moderation, growth mechanics
4. **Content Quality** (0-10): Messaging, storytelling, educational value
5. **Growth Mechanics** (0-10): Viral loops, incentives, retention hooks

Tone: Energetic, data-driven, actionable. Use terms like "PMF", "CAC", "LTV", "Viral Coefficient", "Engagement Rate".

Always provide:
- Specific, actionable feedback
- Immediate next steps (this week)
- Short-term goals (1 month)
- Relevant Web3 examples and case studies`;
  }

  buildUserPrompt(ctx) {
    const { submission, trackId, phaseId } = ctx;
    
    return `Context:
- Track: ${trackId}
- Phase: ${phaseId}
- User's GTM/Growth Proposal:
"${submission}"

Evaluate this growth strategy and provide:
1. Scores for each criterion (Market Positioning, GTM Plan, Community, Content, Growth Mechanics)
2. Detailed feedback on strengths and weaknesses
3. Action plan with immediate, week-1, and month-1 tasks

Be specific and reference Web3 best practices.`;
  }

  async run(ctx) {
    return super.run(ctx, {
      response_format: GROWTH_EVALUATION_SCHEMA,
      temperature: 0.6, // Balanced for creativity + structure
      metadata: {
        agent: this.name,
        track: ctx.trackId,
        phase: ctx.phaseId
      }
    });
  }
}

module.exports = GrowthAgent;
```

### Acceptance Criteria
- [ ] GrowthAgent has evaluation schema with action_plan
- [ ] System prompt includes GTM frameworks (AARRR)
- [ ] Evaluation covers 5 growth criteria
- [ ] Action plan includes immediate, week-1, month-1 tasks
- [ ] Temperature set to 0.6 for balanced output
- [ ] Agent integrated in AgentFactory

---

## 🔴 PRIORITY 4: DAO Backend Integration

### Current State
- Frontend UI complete (`GovernanceDashboard.tsx`)
- API endpoints defined in `api.ts`
- Backend routes missing

### Technical Specification

#### 4.1 DAO Data Model

```javascript
// mf-back/models/DaoProposal.js

const mongoose = require('mongoose');

const daoProposalSchema = new mongoose.Schema({
  proposalId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  
  votes: {
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 }
  },
  
  voterDetails: {
    type: Map,
    of: {
      support: { type: String, enum: ['yes', 'no'] },
      weight: { type: Number },
      votedAt: { type: Date }
    }
  },
  
  quorumMet: { type: Boolean, default: false },
  outcome: { type: String }
});

module.exports = mongoose.model('DaoProposal', daoProposalSchema);
```

#### 4.2 DAO Configuration

```javascript
// mf-back/config/dao-config.js

module.exports = {
  quorumPercent: 30, // 30% of voting power required
  totalVotingPower: 10000,
  voters: [
    { id: 'voter_1', name: 'Community Pool', weight: 3000 },
    { id: 'voter_2', name: 'Team', weight: 2000 },
    { id: 'voter_3', name: 'Investors', weight: 2000 },
    { id: 'voter_4', name: 'Builders', weight: 1500 },
    { id: 'voter_5', name: 'Educators', weight: 1500 }
  ]
};
```

#### 4.3 DAO Routes

```javascript
// mf-back/routes/dao-routes.js

const express = require('express');
const router = express.Router();
const daoController = require('../controllers/dao-controller');
const { protect } = require('../middleware/auth');

router.get('/config', daoController.getConfig);
router.get('/proposals', daoController.getProposals);
router.post('/proposals', daoController.createProposal); // Admin only in production
router.post('/proposals/:id/vote', daoController.castVote);
router.post('/proposals/:id/close', daoController.closeProposal); // Admin only

module.exports = router;
```

#### 4.4 DAO Controller

```javascript
// mf-back/controllers/dao-controller.js

const DaoProposal = require('../models/DaoProposal');
const daoConfig = require('../config/dao-config');

exports.getConfig = async (req, res) => {
  try {
    res.json({
      quorumPercent: daoConfig.quorumPercent,
      totalVotingPower: daoConfig.totalVotingPower,
      voters: daoConfig.voters
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch DAO config' });
  }
};

exports.getProposals = async (req, res) => {
  try {
    const proposals = await DaoProposal.find().sort({ createdAt: -1 });
    
    const formattedProposals = proposals.map(p => ({
      id: p.proposalId,
      title: p.title,
      description: p.description,
      createdBy: p.createdBy,
      createdAt: p.createdAt.toISOString(),
      closedAt: p.closedAt?.toISOString(),
      status: p.status,
      votes: p.votes,
      voterDetails: Object.fromEntries(p.voterDetails),
      quorumMet: p.quorumMet,
      outcome: p.outcome
    }));
    
    res.json({ proposals: formattedProposals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch proposals' });
  }
};

exports.createProposal = async (req, res) => {
  try {
    const { title, description, createdBy } = req.body;
    
    const proposalId = `prop_${Date.now()}`;
    
    const proposal = await DaoProposal.create({
      proposalId,
      title,
      description,
      createdBy: createdBy || 'anonymous'
    });
    
    res.status(201).json({
      proposal: {
        id: proposal.proposalId,
        title: proposal.title,
        description: proposal.description,
        createdBy: proposal.createdBy,
        createdAt: proposal.createdAt.toISOString(),
        status: proposal.status,
        votes: proposal.votes,
        voterDetails: {},
        quorumMet: false
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create proposal' });
  }
};

exports.castVote = async (req, res) => {
  try {
    const { id } = req.params;
    const { voterId, support } = req.body;
    
    const proposal = await DaoProposal.findOne({ proposalId: id });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    if (proposal.status === 'closed') {
      return res.status(400).json({ error: 'Proposal is closed' });
    }
    
    // Find voter weight
    const voter = daoConfig.voters.find(v => v.id === voterId);
    if (!voter) {
      return res.status(400).json({ error: 'Invalid voter ID' });
    }
    
    // Normalize support to 'yes' or 'no'
    const normalizedSupport = (support === true || support === 'yes') ? 'yes' : 'no';
    
    // Check if already voted
    const existingVote = proposal.voterDetails.get(voterId);
    if (existingVote) {
      // Remove previous vote
      if (existingVote.support === 'yes') {
        proposal.votes.yes -= voter.weight;
      } else {
        proposal.votes.no -= voter.weight;
      }
    }
    
    // Add new vote
    if (normalizedSupport === 'yes') {
      proposal.votes.yes += voter.weight;
    } else {
      proposal.votes.no += voter.weight;
    }
    
    proposal.voterDetails.set(voterId, {
      support: normalizedSupport,
      weight: voter.weight,
      votedAt: new Date()
    });
    
    // Check quorum
    const totalVotes = proposal.votes.yes + proposal.votes.no;
    const quorumThreshold = (daoConfig.quorumPercent / 100) * daoConfig.totalVotingPower;
    proposal.quorumMet = totalVotes >= quorumThreshold;
    
    await proposal.save();
    
    res.json({
      proposal: {
        id: proposal.proposalId,
        title: proposal.title,
        description: proposal.description,
        createdBy: proposal.createdBy,
        createdAt: proposal.createdAt.toISOString(),
        closedAt: proposal.closedAt?.toISOString(),
        status: proposal.status,
        votes: proposal.votes,
        voterDetails: Object.fromEntries(proposal.voterDetails),
        quorumMet: proposal.quorumMet,
        outcome: proposal.outcome
      }
    });
  } catch (error) {
    console.error('Vote casting error:', error);
    res.status(500).json({ error: 'Failed to cast vote' });
  }
};

exports.closeProposal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const proposal = await DaoProposal.findOne({ proposalId: id });
    
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }
    
    proposal.status = 'closed';
    proposal.closedAt = new Date();
    
    // Determine outcome
    if (!proposal.quorumMet) {
      proposal.outcome = 'failed_quorum';
    } else if (proposal.votes.yes > proposal.votes.no) {
      proposal.outcome = 'passed';
    } else {
      proposal.outcome = 'rejected';
    }
    
    await proposal.save();
    
    res.json({
      proposal: {
        id: proposal.proposalId,
        title: proposal.title,
        description: proposal.description,
        createdBy: proposal.createdBy,
        createdAt: proposal.createdAt.toISOString(),
        closedAt: proposal.closedAt.toISOString(),
        status: proposal.status,
        votes: proposal.votes,
        voterDetails: Object.fromEntries(proposal.voterDetails),
        quorumMet: proposal.quorumMet,
        outcome: proposal.outcome
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close proposal' });
  }
};
```

#### 4.5 Register Routes

```javascript
// mf-back/server.js or app.js

const daoRoutes = require('./routes/dao-routes');
app.use('/dao', daoRoutes);
```

### Acceptance Criteria
- [ ] DAO models and config created
- [ ] All DAO endpoints functional
- [ ] Vote tallying works correctly
- [ ] Quorum calculation accurate
- [ ] Frontend connects to backend
- [ ] Real-time vote updates visible

---

## 🔴 PRIORITY 5: E2E Testing

### Test Scenarios

#### 5.1 Authentication Flow

```typescript
// web/e2e/auth.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.fill('[name="wallet_address"]', 'TestWallet123');
    await page.selectOption('[name="persona"]', 'student');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/journeys');
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/journeys');
  });
});
```

#### 5.2 Journey Flow

```typescript
// web/e2e/journey.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Journey Progression', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');
  });

  test('should select persona and start journey', async ({ page }) => {
    await page.goto('/journeys');
    
    // Select Cognitive Activation Hub
    await page.click('[data-persona-id="cognitive-activation-hub"]');
    
    await expect(page).toHaveURL(/\/journey\/cognitive-activation-hub/);
    
    // Start first phase
    await page.click('button:has-text("Start / Continue")');
    
    // Wait for Zyno response
    await page.waitForSelector('[data-testid="ui-blocks"]', { timeout: 10000 });
    
    // Verify UI blocks rendered
    const blocks = await page.locator('[data-block-type]').count();
    expect(blocks).toBeGreaterThan(0);
  });

  test('should submit mission and receive evaluation', async ({ page }) => {
    await page.goto('/journey/cognitive-activation-hub');
    
    // Fill mission submission
    await page.fill('[data-testid="mission-input"]', 'My project is an educational DAO...');
    
    await page.click('button:has-text("Submit Mission")');
    
    // Wait for evaluation
    await page.waitForSelector('[data-testid="evaluation-block"]', { timeout: 15000 });
    
    // Verify score displayed
    const score = await page.locator('[data-testid="global-score"]').textContent();
    expect(parseFloat(score || '0')).toBeGreaterThan(0);
  });
});
```

#### 5.3 NFT Minting (with Mock)

```typescript
// web/e2e/nft-minting.spec.ts

import { test, expect } from '@playwright/test';

test.describe('NFT Minting', () => {
  test('should mint NFT after phase completion', async ({ page, context }) => {
    // Mock Solana wallet
    await context.addInitScript(() => {
      (window as any).solana = {
        isPhantom: true,
        publicKey: { toString: () => 'MockPublicKey123' },
        connect: async () => ({ publicKey: { toString: () => 'MockPublicKey123' } }),
        signTransaction: async (tx: any) => tx
      };
    });

    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'SecurePass123!');
    await page.click('button[type="submit"]');

    await page.goto('/journey/cognitive-activation-hub');
    
    // Complete phase
    await page.click('button:has-text("Complete Phase")');
    
    // NFT modal should appear
    await page.waitForSelector('[data-testid="nft-proof-modal"]');
    
    // Click mint button
    await page.click('button:has-text("Mint Proof-of-Skill™ NFT")');
    
    // Wait for minting process
    await page.waitForSelector('[data-testid="mint-tx-signature"]', { timeout: 20000 });
    
    // Verify transaction signature displayed
    const txSig = await page.locator('[data-testid="mint-tx-signature"]').textContent();
    expect(txSig).toBeTruthy();
  });
});
```

### CI Integration

```yaml
# .github/workflows/e2e-tests.yml

name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd web
          npm ci
      
      - name: Install Playwright
        run: |
          cd web
          npx playwright install --with-deps
      
      - name: Run E2E tests
        run: |
          cd web
          npm run test:e2e
        env:
          VITE_API_BASE_URL: http://localhost:3000
          VITE_SOLANA_API_BASE_URL: http://localhost:3001
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: web/playwright-report/
```

### Acceptance Criteria
- [ ] Auth flow tests pass
- [ ] Journey progression tests pass
- [ ] Mission submission tests pass
- [ ] NFT minting tests pass (with mock wallet)
- [ ] CI integration configured
- [ ] Test coverage report generated

---

## Timeline & Resource Allocation

### Week 1
- **Days 1-2:** Priority 1 (Mission Submission Flow)
- **Days 3-4:** Priority 2 (Demo Scripted Mode)
- **Day 5:** Priority 3 (GrowthAgent)

### Week 2
- **Days 1-2:** Priority 4 (DAO Backend)
- **Days 3-5:** Priority 5 (E2E Testing)

### Resources Required
- 1 Backend Developer (Node.js, MongoDB)
- 1 Frontend Developer (React, TypeScript)
- 1 QA Engineer (Playwright, E2E testing)

---

## Success Metrics

- ✅ All 5 high-priority items completed
- ✅ E2E test suite passing with >80% coverage
- ✅ Demo mode functional for all 6 personas
- ✅ Mission submission flow end-to-end working
- ✅ DAO voting functional with real-time updates
- ✅ NFT minting success rate >95% on devnet

---

## Next Steps After Completion

1. **Medium Priority Items:**
   - Audit Mode implementation
   - RAG integration for resources
   - Enhanced micro-interactions

2. **Documentation:**
   - Update OpenAPI specification
   - Create deployment guide
   - Write user documentation

3. **Performance & Monitoring:**
   - Add structured logging
   - Implement metrics dashboard
   - Set up error tracking (Sentry)

4. **Production Readiness:**
   - Security audit
   - Load testing
   - Mainnet preparation
