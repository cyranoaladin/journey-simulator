# 🧪 Testing Plan - Priorities 1-3
**Date:** 2025-11-20  
**Scope:** Mission Submission, Demo Mode, GrowthAgent  
**Status:** Ready for Testing

---

## 📋 Test Checklist

### ✅ Priority 1: Mission Submission Flow

#### Unit Tests
- [ ] MissionSubmission model validation
- [ ] XP calculation logic (score * 10)
- [ ] NFT eligibility logic (score >= 8.0)
- [ ] Agent selection via AgentFactory
- [ ] Database persistence
- [ ] User XP update

#### Integration Tests
- [ ] POST /journey/:journeyId/submit with valid data
- [ ] POST /journey/:journeyId/submit with missing fields
- [ ] POST /journey/:journeyId/submit with invalid journeyId
- [ ] Verify database record created
- [ ] Verify user XP updated
- [ ] Verify next_step returned

#### Manual Tests
- [ ] Submit mission with TokenomicsAgent (score 9.0)
- [ ] Submit mission with GrowthAgent (score 8.5)
- [ ] Submit mission with low score (score 6.0)
- [ ] Verify NFT eligibility for high scores
- [ ] Verify Zyno next step generation
- [ ] Test error handling

---

### ✅ Priority 2: Demo Scripted Mode

#### Unit Tests
- [ ] Demo state JSON file loading
- [ ] Journey creation/update logic
- [ ] User progress update logic
- [ ] Demo mode flag setting

#### Integration Tests
- [ ] POST /journey/load-demo for each persona
- [ ] POST /journey/load-demo with invalid personaId
- [ ] POST /journey/load-demo without personaId
- [ ] Verify journey created with demo data
- [ ] Verify user progress updated
- [ ] Verify demo_mode flag set

#### Manual Tests
- [ ] Load demo for Cognitive Activation Hub
- [ ] Load demo for Capital Foundry
- [ ] Load demo for System Architect
- [ ] Load demo for Experience Studio
- [ ] Load demo for Impact Engine
- [ ] Load demo for Resilience Master
- [ ] Verify NFT certificates loaded
- [ ] Verify agent history loaded

---

### ✅ Priority 3: GrowthAgent Implementation

#### Unit Tests
- [ ] GrowthAgent system prompt generation
- [ ] GrowthAgent user prompt generation
- [ ] Evaluation schema validation
- [ ] Action plan structure validation

#### Integration Tests
- [ ] Submit growth strategy to GrowthAgent
- [ ] Verify evaluation returned
- [ ] Verify 5 axes scored
- [ ] Verify action_plan structure
- [ ] Verify AARRR framework applied

#### Manual Tests
- [ ] Submit strong growth strategy
- [ ] Submit weak growth strategy
- [ ] Submit medium growth strategy
- [ ] Verify action plan quality
- [ ] Verify feedback relevance
- [ ] Test with different track/phase contexts

---

## 🔧 Test Scripts

### Script 1: Test Mission Submission
```bash
# Test mission submission with TokenomicsAgent
curl -X POST http://localhost:3000/journey/test-journey-123/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "missionId": "tokenomics_design",
    "submission": "My tokenomics model includes a deflationary supply with 1B total tokens, 40% for community, 30% for team (4-year vest), 20% for liquidity, 10% for treasury. Utility includes governance, staking rewards (8% APY), and fee discounts.",
    "inputType": "text",
    "trackId": "capital-foundry",
    "phaseId": "token-design-lab"
  }'
```

### Script 2: Test Demo Mode Loading
```bash
# Test demo loading for Cognitive Activation Hub
curl -X POST http://localhost:3000/journey/load-demo \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "personaId": "cognitive-activation-hub"
  }'
```

### Script 3: Test GrowthAgent
```bash
# Test growth strategy evaluation
curl -X POST http://localhost:3000/journey/test-journey-456/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "missionId": "growth_strategy",
    "submission": "Our GTM strategy focuses on Twitter growth through educational threads, Discord community building with ambassador program, and partnerships with Web3 influencers. We will launch with a waitlist campaign, offer early adopter NFTs, and implement referral rewards (10% bonus tokens).",
    "inputType": "text",
    "trackId": "capital-foundry",
    "phaseId": "growth-phase"
  }'
```

---

## 🎯 Success Criteria

### Priority 1: Mission Submission
✅ **PASS** if:
- Mission submission creates database record
- XP is calculated correctly (score * 10)
- NFT eligibility is determined (score >= 8.0)
- User XP is updated in database
- next_step is returned with evaluation_block
- Error handling works for invalid inputs

❌ **FAIL** if:
- Database record not created
- XP calculation incorrect
- NFT eligibility logic broken
- User XP not updated
- next_step missing or malformed
- Errors not handled gracefully

---

### Priority 2: Demo Mode
✅ **PASS** if:
- All 6 demo states load successfully
- Journey is created/updated with demo data
- User progress reflects demo state
- demo_mode flag is set to true
- NFT certificates are loaded
- Agent history is preserved

❌ **FAIL** if:
- Demo state fails to load
- Journey not created/updated
- User progress not updated
- demo_mode flag not set
- Data corruption or loss

---

### Priority 3: GrowthAgent
✅ **PASS** if:
- Evaluation returned with global_score
- 5 axes scored (Market, GTM, Community, Content, Growth)
- action_plan includes immediate_actions, week_1, month_1
- Feedback is relevant and actionable
- AARRR framework evident in feedback
- Temperature 0.6 produces balanced output

❌ **FAIL** if:
- Evaluation missing or malformed
- Axes incomplete or incorrect
- action_plan missing or empty
- Feedback generic or irrelevant
- Schema validation errors

---

## 📊 Test Results Template

### Test Run: [Date/Time]

#### Priority 1: Mission Submission
| Test Case | Status | Notes |
|-----------|--------|-------|
| Submit with valid data | ⏳ | |
| Database persistence | ⏳ | |
| XP calculation | ⏳ | |
| NFT eligibility | ⏳ | |
| next_step generation | ⏳ | |
| Error handling | ⏳ | |

#### Priority 2: Demo Mode
| Test Case | Status | Notes |
|-----------|--------|-------|
| Load Cognitive Activation Hub | ⏳ | |
| Load Capital Foundry | ⏳ | |
| Load System Architect | ⏳ | |
| Load Experience Studio | ⏳ | |
| Load Impact Engine | ⏳ | |
| Load Resilience Master | ⏳ | |
| Journey creation | ⏳ | |
| User progress update | ⏳ | |

#### Priority 3: GrowthAgent
| Test Case | Status | Notes |
|-----------|--------|-------|
| Strong strategy evaluation | ⏳ | |
| Weak strategy evaluation | ⏳ | |
| Action plan generation | ⏳ | |
| AARRR framework | ⏳ | |
| 5 axes scoring | ⏳ | |

---

## 🐛 Known Issues / Bugs

### Priority 1
- [ ] None identified yet

### Priority 2
- [ ] None identified yet

### Priority 3
- [ ] None identified yet

---

## 📝 Test Notes

### Environment Setup
- Node.js version: [TBD]
- MongoDB version: [TBD]
- OpenAI API key: [Configured]
- Test database: [TBD]

### Prerequisites
- [ ] Backend server running
- [ ] MongoDB connected
- [ ] OpenAI API key configured
- [ ] Test user created
- [ ] JWT token obtained

---

## 🚀 Next Steps After Testing

### If All Tests Pass ✅
1. Update MVP_COMPLETION_CHECKLIST.md
2. Mark Priorities 1-3 as tested and verified
3. Begin Priority 4 (DAO Backend)
4. Update IMPLEMENTATION_PROGRESS.md

### If Tests Fail ❌
1. Document failures in this file
2. Create bug fix tickets
3. Fix issues
4. Re-test
5. Update documentation

---

**Status:** Ready for testing  
**Tester:** [Your Name]  
**Date:** 2025-11-20
