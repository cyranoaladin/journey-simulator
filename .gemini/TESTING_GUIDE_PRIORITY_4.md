# 🧪 Testing Guide - Priority 4 (DAO + Demo Mode)
**Date:** 2025-11-20  
**Purpose:** Test DAO Backend and Demo Mode Frontend Integration

---

## 🚀 Prerequisites

### 1. Start Backend Server
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front/mf-back
npm start
```

**Expected Output:**
```
✅ MongoDB Connected - Database is ready
Server listening on port 3000
```

### 2. Verify Server Health
```bash
curl http://localhost:3000/health
```

**Expected:** `{"status":"ok"}` or similar

---

## ✅ TEST SUITE 1: DAO BACKEND

### Test 1.1: Get DAO Configuration

**Command:**
```bash
curl http://localhost:3000/dao/config | jq '.'
```

**Expected Response:**
```json
{
  "quorumPercent": 30,
  "totalVotingPower": 10000,
  "voters": [
    {
      "id": "voter_1",
      "name": "Community Pool",
      "weight": 3000,
      "description": "Represents the broader community"
    },
    {
      "id": "voter_2",
      "name": "Team",
      "weight": 2000,
      "description": "Core team members"
    },
    {
      "id": "voter_3",
      "name": "Investors",
      "weight": 2000,
      "description": "Early investors and backers"
    },
    {
      "id": "voter_4",
      "name": "Builders",
      "weight": 1500,
      "description": "Active builders and contributors"
    },
    {
      "id": "voter_5",
      "name": "Educators",
      "weight": 1500,
      "description": "Educational content creators"
    }
  ],
  "proposalSettings": {
    "minVotingPeriod": 86400000,
    "maxVotingPeriod": 604800000,
    "executionDelay": 172800000
  }
}
```

**Verification:**
- [ ] HTTP status 200
- [ ] `quorumPercent` is 30
- [ ] `totalVotingPower` is 10000
- [ ] 5 voters returned
- [ ] Total voter weight = 10000 (3000 + 2000 + 2000 + 1500 + 1500)

---

### Test 1.2: Get Proposals (Empty)

**Command:**
```bash
curl http://localhost:3000/dao/proposals | jq '.'
```

**Expected Response:**
```json
{
  "proposals": []
}
```

**Verification:**
- [ ] HTTP status 200
- [ ] Empty proposals array

---

### Test 1.3: Create First Proposal

**Command:**
```bash
curl -X POST http://localhost:3000/dao/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Increase Staking Rewards to 12% APY",
    "description": "Proposal to increase staking rewards from 8% to 12% APY to incentivize long-term holders and improve network security.",
    "createdBy": "test_user_1"
  }' | jq '.'
```

**Expected Response:**
```json
{
  "proposal": {
    "id": "prop_1732095600000",
    "title": "Increase Staking Rewards to 12% APY",
    "description": "Proposal to increase staking rewards from 8% to 12% APY...",
    "createdBy": "test_user_1",
    "createdAt": "2025-11-20T...",
    "status": "active",
    "votes": {
      "yes": 0,
      "no": 0
    },
    "voterDetails": {},
    "quorumMet": false
  }
}
```

**Verification:**
- [ ] HTTP status 201
- [ ] Proposal has unique ID
- [ ] Status is "active"
- [ ] Votes are 0/0
- [ ] quorumMet is false

**Save the proposal ID for next tests!**

---

### Test 1.4: Create Second Proposal

**Command:**
```bash
curl -X POST http://localhost:3000/dao/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement Cross-Chain Bridge",
    "description": "Proposal to develop and deploy a cross-chain bridge to Ethereum mainnet for increased liquidity and interoperability.",
    "createdBy": "test_user_2"
  }' | jq '.'
```

**Verification:**
- [ ] HTTP status 201
- [ ] Different proposal ID from first
- [ ] Status is "active"

---

### Test 1.5: Get All Proposals

**Command:**
```bash
curl http://localhost:3000/dao/proposals | jq '.'
```

**Expected:**
- 2 proposals in array
- Both with status "active"

**Verification:**
- [ ] HTTP status 200
- [ ] 2 proposals returned
- [ ] Both have status "active"

---

### Test 1.6: Vote YES (Community Pool)

**Command:** (Replace `PROPOSAL_ID` with actual ID from Test 1.3)
```bash
curl -X POST http://localhost:3000/dao/proposals/PROPOSAL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "voter_1",
    "support": true
  }' | jq '.'
```

**Expected Response:**
```json
{
  "proposal": {
    "id": "prop_...",
    "votes": {
      "yes": 3000,
      "no": 0
    },
    "voterDetails": {
      "voter_1": {
        "support": "yes",
        "weight": 3000,
        "votedAt": "2025-11-20T..."
      }
    },
    "quorumMet": true
  }
}
```

**Verification:**
- [ ] HTTP status 200
- [ ] `votes.yes` is 3000
- [ ] `votes.no` is 0
- [ ] `quorumMet` is **true** (3000 ≥ 3000 threshold)
- [ ] `voterDetails` contains voter_1

---

### Test 1.7: Vote NO (Team)

**Command:**
```bash
curl -X POST http://localhost:3000/dao/proposals/PROPOSAL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "voter_2",
    "support": false
  }' | jq '.'
```

**Expected:**
- `votes.yes`: 3000
- `votes.no`: 2000
- `quorumMet`: true (total 5000 ≥ 3000)

**Verification:**
- [ ] HTTP status 200
- [ ] `votes.no` is 2000
- [ ] `quorumMet` still true
- [ ] `voterDetails` contains voter_1 and voter_2

---

### Test 1.8: Change Vote (Team → YES)

**Command:**
```bash
curl -X POST http://localhost:3000/dao/proposals/PROPOSAL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "voter_2",
    "support": true
  }' | jq '.'
```

**Expected:**
- `votes.yes`: 5000 (3000 + 2000)
- `votes.no`: 0 (removed)
- `quorumMet`: true

**Verification:**
- [ ] HTTP status 200
- [ ] `votes.yes` is 5000
- [ ] `votes.no` is 0
- [ ] voter_2 support changed to "yes"

---

### Test 1.9: Close Proposal

**Command:**
```bash
curl -X POST http://localhost:3000/dao/proposals/PROPOSAL_ID/close \
  -H "Content-Type: application/json" | jq '.'
```

**Expected Response:**
```json
{
  "proposal": {
    "id": "prop_...",
    "status": "closed",
    "closedAt": "2025-11-20T...",
    "votes": {
      "yes": 5000,
      "no": 0
    },
    "quorumMet": true,
    "outcome": "passed"
  }
}
```

**Verification:**
- [ ] HTTP status 200
- [ ] `status` is "closed"
- [ ] `closedAt` is set
- [ ] `outcome` is "passed" (yes > no and quorum met)

---

### Test 1.10: Get Closed Proposals

**Command:**
```bash
curl http://localhost:3000/dao/proposals?status=closed | jq '.'
```

**Verification:**
- [ ] HTTP status 200
- [ ] At least 1 closed proposal
- [ ] All have status "closed"

---

### Test 1.11: Error Cases

**Test 1.11a: Create Proposal without title**
```bash
curl -X POST http://localhost:3000/dao/proposals \
  -H "Content-Type: application/json" \
  -d '{
    "description": "This should fail"
  }' | jq '.'
```

**Expected:** HTTP 400, error message "Title is required"

**Test 1.11b: Vote with invalid voter ID**
```bash
curl -X POST http://localhost:3000/dao/proposals/PROPOSAL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "invalid_voter",
    "support": true
  }' | jq '.'
```

**Expected:** HTTP 400, error message "Invalid voter ID"

**Test 1.11c: Vote on closed proposal**
```bash
curl -X POST http://localhost:3000/dao/proposals/PROPOSAL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voterId": "voter_3",
    "support": true
  }' | jq '.'
```

**Expected:** HTTP 400, error message "Proposal is closed"

---

## ✅ TEST SUITE 2: DEMO MODE (FRONTEND)

### Prerequisites
1. Backend running (from above)
2. Start frontend:
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front/journey-simulator
npm run dev
```

3. Open browser to `http://localhost:5173`

---

### Test 2.1: Verify Demo Button Exists

**Steps:**
1. Navigate to `/journeys` page
2. Look at any persona card
3. Locate the "Load Demo State" button

**Expected:**
- Button is visible below main action button
- Button has yellow/gold styling
- Button text: "Load Demo State"
- Button has 🎬 icon

**Verification:**
- [ ] Button is visible
- [ ] Button has correct styling
- [ ] Tooltip shows on hover

---

### Test 2.2: Load Demo (Cognitive Activation Hub)

**Steps:**
1. Click "Load Demo State" on Cognitive Activation Hub card
2. Wait for loading state
3. Observe response

**Expected:**
- Button shows "Loading Demo..." with spinner
- After ~1-2 seconds, journey starts
- User is redirected to journey workspace
- Progress shows 3/5 phases complete
- XP shows 2500
- Level shows 3

**Verification:**
- [ ] Loading state shows
- [ ] Journey loads successfully
- [ ] Progress data matches demo state
- [ ] No errors in console

---

### Test 2.3: Load Demo (Capital Foundry)

**Steps:**
1. Return to `/journeys` page
2. Click "Load Demo State" on Capital Foundry card

**Expected:**
- Journey loads with 4/5 phases complete
- XP shows 3800
- Level shows 4

**Verification:**
- [ ] Demo loads successfully
- [ ] Progress: 4/5 phases
- [ ] XP: 3800
- [ ] Level: 4

---

### Test 2.4: Load Demo (All Personas)

Repeat for each persona and verify:

| Persona | Phases | XP | Level | NFTs |
|---------|--------|-----|-------|------|
| Cognitive Activation Hub | 3/5 | 2500 | 3 | 3 |
| Capital Foundry | 4/5 | 3800 | 4 | 4 |
| System Architect | 3/5 | 3200 | 4 | 3 |
| Experience Studio | 3/5 | 2900 | 3 | 3 |
| Impact Engine | 4/5 | 3500 | 4 | 4 |
| Resilience Master | 3/5 | 3100 | 4 | 3 |

**Verification:**
- [ ] All 6 demos load successfully
- [ ] Progress data matches table
- [ ] No errors

---

### Test 2.5: Error Handling

**Test 2.5a: Network Error**
1. Stop backend server
2. Try to load demo
3. Observe error message

**Expected:**
- Error message displayed
- User-friendly error text
- Button returns to normal state

**Test 2.5b: Invalid Persona**
(This would require modifying the code temporarily)

---

## ✅ TEST SUITE 3: INTEGRATION TESTS

### Test 3.1: Demo Mode → Mission Submission

**Steps:**
1. Load demo for any persona
2. Navigate to a mission
3. Submit a mission
4. Verify XP increases

**Expected:**
- Mission submission works
- XP increases from demo base
- Evaluation returned

**Verification:**
- [ ] Demo loads
- [ ] Mission submission works
- [ ] XP updates correctly

---

### Test 3.2: Demo Mode → DAO Voting

**Steps:**
1. Load demo for any persona
2. Navigate to DAO page
3. View proposals
4. Cast a vote

**Expected:**
- DAO page shows proposals
- Voting works normally
- Demo mode doesn't interfere

**Verification:**
- [ ] DAO page accessible
- [ ] Proposals visible
- [ ] Voting works

---

## 📊 Test Results Summary

### DAO Backend Tests
| Test | Status | Notes |
|------|--------|-------|
| Get Config | ⏳ | |
| Get Proposals (empty) | ⏳ | |
| Create Proposal 1 | ⏳ | |
| Create Proposal 2 | ⏳ | |
| Get All Proposals | ⏳ | |
| Vote YES | ⏳ | |
| Vote NO | ⏳ | |
| Change Vote | ⏳ | |
| Close Proposal | ⏳ | |
| Get Closed Proposals | ⏳ | |
| Error Cases | ⏳ | |

### Demo Mode Frontend Tests
| Test | Status | Notes |
|------|--------|-------|
| Button Exists | ⏳ | |
| Load CAH Demo | ⏳ | |
| Load CF Demo | ⏳ | |
| Load All Demos | ⏳ | |
| Error Handling | ⏳ | |

### Integration Tests
| Test | Status | Notes |
|------|--------|-------|
| Demo → Mission | ⏳ | |
| Demo → DAO | ⏳ | |

---

## 🐛 Issues Found

Document any issues here:

1. **Issue:** [Description]
   - **Severity:** High/Medium/Low
   - **Steps to reproduce:** [...]
   - **Expected:** [...]
   - **Actual:** [...]
   - **Fix:** [...]

---

## ✅ Sign-off

- [ ] All DAO backend tests passed
- [ ] All demo mode tests passed
- [ ] All integration tests passed
- [ ] No critical issues found
- [ ] Ready for production

**Tested by:** _____________  
**Date:** _____________  
**Signature:** _____________

---

## 🚀 Quick Test Commands

### Automated DAO Test
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front/mf-back
./test-dao-backend.sh
```

### Automated Demo Test
```bash
cd /home/alaeddine/Documents/journey_mfai_back_front/mf-back
./test-demo-mode.sh
```

### Manual Frontend Test
1. Start backend: `cd mf-back && npm start`
2. Start frontend: `cd journey-simulator && npm run dev`
3. Open `http://localhost:5173/journeys`
4. Click "Load Demo State" buttons
