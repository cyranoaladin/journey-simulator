# 🧪 Manual Testing Guide - Priorities 1-3
**Date:** 2025-11-20  
**Purpose:** Step-by-step manual testing instructions

---

## 🚀 Prerequisites

### 1. Start Backend Server
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front/mf-back
npm start
```

### 2. Verify Server is Running
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### 3. Get Authentication Token
```bash
# Option 1: Use existing token from localStorage
# Option 2: Login to get token
curl -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "your_password"
  }'
```

Save the `accessToken` from the response for use in tests below.

---

## ✅ Test 1: Demo Mode Loading

### Test 1.1: Load Cognitive Activation Hub Demo

**Command:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "personaId": "cognitive-activation-hub"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Demo state loaded successfully",
  "journey": {
    "_id": "...",
    "user_id": "...",
    "journey_type": "cognitive-activation-hub",
    "current_phase": 3,
    "completion_percentage": 60,
    "demo_mode": true,
    "demo_loaded_at": "2025-11-20T..."
  },
  "demo_state": {
    "persona_id": "cognitive-activation-hub",
    "total_xp": 2500,
    "current_level": 3,
    "nft_certificates": [...]
  }
}
```

**Verification Checklist:**
- [ ] HTTP status 200
- [ ] `success: true`
- [ ] `journey.demo_mode: true`
- [ ] `journey.current_phase: 3`
- [ ] `demo_state.total_xp: 2500`
- [ ] `demo_state.nft_certificates` has 3 items

---

### Test 1.2: Load All Other Personas

Repeat the above test for each persona:

**Capital Foundry:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"personaId": "capital-foundry"}'
```
Expected: `current_phase: 4`, `total_xp: 3800`, 4 NFTs

**System Architect:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"personaId": "system-architect"}'
```
Expected: `current_phase: 3`, `total_xp: 3200`, 3 NFTs

**Experience Studio:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"personaId": "experience-studio"}'
```
Expected: `current_phase: 3`, `total_xp: 2900`, 3 NFTs

**Impact Engine:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"personaId": "impact-engine"}'
```
Expected: `current_phase: 4`, `total_xp: 3500`, 4 NFTs

**Resilience Master:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"personaId": "resilience-master"}'
```
Expected: `current_phase: 3`, `total_xp: 3100`, 3 NFTs

---

### Test 1.3: Error Cases

**Invalid Persona ID:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"personaId": "invalid-persona"}'
```
Expected: HTTP 404, error message "No demo state found for persona: invalid-persona"

**Missing personaId:**
```bash
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{}'
```
Expected: HTTP 400, error message "personaId is required"

---

## ✅ Test 2: Mission Submission (Requires Backend + MongoDB)

### Test 2.1: Submit Tokenomics Mission (High Score)

**Command:**
```bash
curl -X POST http://localhost:3000/journey/test-journey-123/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "missionId": "tokenomics_design",
    "submission": "My tokenomics model includes:\n- Total Supply: 1 billion tokens\n- Distribution: 40% community, 30% team (4-year vest), 20% liquidity, 10% treasury\n- Utility: Governance voting, staking rewards (8% APY), transaction fee discounts (20%)\n- Deflationary mechanism: 0.5% burn on transfers\n- Incentives: Staking rewards, liquidity mining, governance participation rewards\n- Vesting: Team tokens vest linearly over 4 years with 1-year cliff\n- Governance: 1 token = 1 vote, quorum 10%, proposals require 100k tokens",
    "inputType": "text",
    "trackId": "capital-foundry",
    "phaseId": "token-design-lab"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "submission_id": "...",
  "evaluation": {
    "global_score": 8.5,
    "feedback": "Excellent tokenomics design...",
    "axes": [
      {
        "name": "Utility",
        "score": 9,
        "max_score": 10,
        "comment": "Strong utility with governance, staking, and fee discounts"
      },
      ...
    ]
  },
  "rewards": {
    "xp_delta": 85,
    "nft_eligible": true,
    "nft_result": {
      "eligible": true,
      "message": "Congratulations! You scored 8.5/10 and earned a Proof-of-Skill™ NFT",
      "certification": {
        "name": "token-design-lab - tokenomics_design",
        "rarity": "rare"
      }
    }
  },
  "next_step": {
    "metadata": {...},
    "ui_blocks": [...],
    "agent_actions": [],
    "next_state": {...}
  }
}
```

**Verification Checklist:**
- [ ] HTTP status 200
- [ ] `success: true`
- [ ] `evaluation.global_score` between 8-10
- [ ] `evaluation.axes` has 4 items (Utility, Supply, Incentives, Governance)
- [ ] `rewards.xp_delta` = score * 10 (e.g., 8.5 → 85)
- [ ] `rewards.nft_eligible: true` (score >= 8.0)
- [ ] `nft_result.certification.rarity` is "rare" or "epic"
- [ ] `next_step` contains `ui_blocks` array

---

### Test 2.2: Submit Growth Strategy (Medium Score)

**Command:**
```bash
curl -X POST http://localhost:3000/journey/test-journey-456/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "missionId": "growth_strategy",
    "submission": "Our growth strategy:\n1. Twitter: Post daily educational threads about DeFi\n2. Discord: Build community with 3 channels (general, support, announcements)\n3. Partnerships: Reach out to 5 Web3 influencers\n4. Launch: Waitlist campaign with early adopter NFTs\n5. Referrals: 10% bonus tokens for referrals",
    "inputType": "text",
    "trackId": "capital-foundry",
    "phaseId": "growth-phase"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "submission_id": "...",
  "evaluation": {
    "global_score": 7.2,
    "feedback": "Good foundation but needs more depth...",
    "axes": [
      {
        "name": "Market Positioning",
        "score": 7,
        "max_score": 10,
        "comment": "..."
      },
      {
        "name": "Go-to-Market Plan",
        "score": 7,
        "max_score": 10,
        "comment": "..."
      },
      {
        "name": "Community Strategy",
        "score": 7,
        "max_score": 10,
        "comment": "..."
      },
      {
        "name": "Content Quality",
        "score": 8,
        "max_score": 10,
        "comment": "..."
      },
      {
        "name": "Growth Mechanics",
        "score": 7,
        "max_score": 10,
        "comment": "..."
      }
    ],
    "action_plan": {
      "immediate_actions": [
        "Define your unique value proposition",
        "Create content calendar for next 2 weeks",
        "Set up Discord server with proper channels"
      ],
      "week_1": [
        "Launch waitlist campaign",
        "Publish 3 educational Twitter threads",
        "Reach out to first influencer"
      ],
      "month_1": [
        "Achieve 1000 Discord members",
        "Secure 2 influencer partnerships",
        "Launch referral program"
      ]
    }
  },
  "rewards": {
    "xp_delta": 72,
    "nft_eligible": false,
    "nft_result": null
  }
}
```

**Verification Checklist:**
- [ ] HTTP status 200
- [ ] `evaluation.global_score` between 6-8
- [ ] `evaluation.axes` has 5 items (Market, GTM, Community, Content, Growth)
- [ ] `evaluation.action_plan` has 3 sections (immediate_actions, week_1, month_1)
- [ ] Each action plan section has at least 2 items
- [ ] `rewards.nft_eligible: false` (score < 8.0)
- [ ] `nft_result: null`

---

### Test 2.3: Database Verification

After running Test 2.1 and 2.2, verify in MongoDB:

**Check MissionSubmission collection:**
```javascript
// In MongoDB shell or Compass
db.missionsubmissions.find().sort({submittedAt: -1}).limit(2)
```

**Expected:**
- 2 documents (one for each test)
- `userId` matches authenticated user
- `globalScore` matches evaluation score
- `xpAwarded` = globalScore * 10
- `nftEligible` = true for Test 2.1, false for Test 2.2

**Check User collection:**
```javascript
db.users.findOne({_id: ObjectId("YOUR_USER_ID")})
```

**Expected:**
- `total_xp` increased by sum of xpAwarded (85 + 72 = 157)

---

## ✅ Test 3: GrowthAgent Specific Tests

### Test 3.1: Strong Growth Strategy

**Command:**
```bash
curl -X POST http://localhost:3000/journey/test-journey-789/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "missionId": "growth_strategy_advanced",
    "submission": "Comprehensive GTM Strategy:\n\nMarket Positioning:\n- Target: DeFi power users seeking 15%+ APY\n- Value Prop: Automated yield optimization with AI-driven rebalancing\n- Differentiation: Only protocol with cross-chain yield aggregation\n\nGo-to-Market:\nPhase 1 (Week 1-2): Stealth launch with 100 beta testers\nPhase 2 (Week 3-4): Public launch with $500k liquidity\nPhase 3 (Month 2): Partnerships with 3 major DEXs\n\nCommunity:\n- Discord: 5 channels (general, trading, dev, governance, support)\n- Ambassador program: 20 ambassadors, 1000 USDC/month budget\n- Weekly AMAs with founders\n- Community-driven feature requests\n\nContent:\n- Daily Twitter threads (educational + product updates)\n- Weekly blog posts (deep dives on yield strategies)\n- YouTube tutorials (how to use platform)\n- Podcast appearances (3 per month)\n\nGrowth Mechanics:\n- Referral: 5% of referee earnings for 6 months\n- Liquidity mining: 40% APY for first 30 days\n- Governance: Early users get 2x voting power\n- Retention: Loyalty NFTs for 90-day active users\n\nMetrics (AARRR):\n- Acquisition: 1000 users/month via Twitter + partnerships\n- Activation: 60% deposit within 7 days\n- Retention: 70% monthly active users\n- Revenue: $50k monthly fees at scale\n- Referral: 30% viral coefficient",
    "inputType": "text",
    "trackId": "capital-foundry",
    "phaseId": "growth-phase"
  }'
```

**Expected:**
- `global_score`: 9.0-9.5
- All 5 axes scored 8.5+
- `action_plan` with specific, actionable items
- Feedback references AARRR framework
- NFT eligible (score >= 8.0)

---

### Test 3.2: Weak Growth Strategy

**Command:**
```bash
curl -X POST http://localhost:3000/journey/test-journey-790/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "missionId": "growth_strategy_basic",
    "submission": "We will use social media to promote our product. We will post on Twitter and maybe create a Discord server. We hope to get users through word of mouth.",
    "inputType": "text",
    "trackId": "capital-foundry",
    "phaseId": "growth-phase"
  }'
```

**Expected:**
- `global_score`: 3.0-5.0
- Low scores across all axes
- `action_plan` with many improvement suggestions
- Feedback identifies gaps and provides examples
- NOT NFT eligible (score < 8.0)

---

## 📊 Test Results Summary

### Demo Mode Tests
| Test | Status | Notes |
|------|--------|-------|
| Load Cognitive Activation Hub | ⏳ | |
| Load Capital Foundry | ⏳ | |
| Load System Architect | ⏳ | |
| Load Experience Studio | ⏳ | |
| Load Impact Engine | ⏳ | |
| Load Resilience Master | ⏳ | |
| Invalid persona error | ⏳ | |
| Missing personaId error | ⏳ | |

### Mission Submission Tests
| Test | Status | Notes |
|------|--------|-------|
| Tokenomics (high score) | ⏳ | |
| Growth strategy (medium) | ⏳ | |
| Database persistence | ⏳ | |
| User XP update | ⏳ | |
| NFT eligibility (>=8.0) | ⏳ | |
| next_step generation | ⏳ | |

### GrowthAgent Tests
| Test | Status | Notes |
|------|--------|-------|
| Strong strategy (9+) | ⏳ | |
| Weak strategy (3-5) | ⏳ | |
| Action plan quality | ⏳ | |
| AARRR framework | ⏳ | |
| 5 axes scoring | ⏳ | |

---

## 🐛 Issues Found

Document any issues here:

1. **Issue:** [Description]
   - **Severity:** High/Medium/Low
   - **Steps to reproduce:** [...]
   - **Expected:** [...]
   - **Actual:** [...]

---

## ✅ Sign-off

- [ ] All demo mode tests passed
- [ ] All mission submission tests passed
- [ ] All GrowthAgent tests passed
- [ ] Database verification complete
- [ ] No critical issues found

**Tested by:** _____________  
**Date:** _____________  
**Signature:** _____________
