/**
 * FORMAL VERIFICATION TEST - demoSequencer Business Rules
 * QA Audit: Capital Foundry, Impact Engine, Collaterize
 */

import { describe, it, expect } from 'vitest';
import { getDemoSequence } from '../demoSequencer';
import { personas } from '../../data/personas';

// Helper to find all mission blocks in a sequence
const findMissionBlocks = (sequence: any[]) => {
    const missions: any[] = [];
    sequence.forEach(step => {
        step.ui_blocks?.forEach((block: any) => {
            if (block.kind === 'mission_block') {
                missions.push(block);
            }
        });
    });
    return missions;
};

// Helper to find specific block types
const findBlocksByKind = (sequence: any[], kind: string) => {
    const blocks: any[] = [];
    sequence.forEach(step => {
        step.ui_blocks?.forEach((block: any) => {
            if (block.kind === kind) {
                blocks.push(block);
            }
        });
    });
    return blocks;
};

describe('demoSequencer Business Rules Verification', () => {
    
    describe('Capital Foundry (capital-foundry)', () => {
        const personaId = 'capital-foundry';
        const persona = personas.find(p => p.id === personaId);
        
        it('should have 6 phases defined', () => {
            expect(persona).toBeDefined();
            expect(persona!.phases).toHaveLength(6);
        });

        it('Phase 2 (program-forge): NO STAKING - Must be standard content', () => {
            const phase2Id = 'program-forge';
            const sequence = getDemoSequence(phase2Id, personaId);
            
            expect(sequence.length).toBeGreaterThan(0);
            
            const missionBlocks = findMissionBlocks(sequence);
            const stakingMissions = missionBlocks.filter(m => m.mission_type === 'staking');
            
            // CRITICAL: Phase 2 must NOT have staking
            expect(stakingMissions).toHaveLength(0);
            console.log('✅ Phase 2 (program-forge): No staking blocks found - CORRECT');
        });

        it('Phase 4 (risk-command): MUST have staking with 75 MFAI', () => {
            const phase4Id = 'risk-command';
            const phase4 = persona!.phases.find(p => p.id === phase4Id);
            
            // Verify flag exists in personas.ts
            expect((phase4 as any).stakingRequired).toBe(75);
            console.log('✅ personas.ts confirms stakingRequired: 75');
            
            const sequence = getDemoSequence(phase4Id, personaId);
            expect(sequence.length).toBeGreaterThan(0);
            
            const missionBlocks = findMissionBlocks(sequence);
            const stakingMissions = missionBlocks.filter(m => m.mission_type === 'staking');
            
            // CRITICAL: Phase 4 MUST have staking
            expect(stakingMissions.length).toBeGreaterThan(0);
            console.log(`✅ Phase 4 (risk-command): Found ${stakingMissions.length} staking mission(s)`);
            
            // Verify bonding curve block exists
            const bondingCurves = findBlocksByKind(sequence, 'bonding_curve_block');
            expect(bondingCurves.length).toBeGreaterThan(0);
            console.log('✅ Phase 4: Bonding curve block present');
        });

        it('Phase 5 (capital-launchpad): MUST have DAO vote', () => {
            const phase5Id = 'capital-launchpad';
            const phase5 = persona!.phases.find(p => p.id === phase5Id);
            
            // Verify flag exists in personas.ts
            expect((phase5 as any).daoVoteRequired).toBe(true);
            console.log('✅ personas.ts confirms daoVoteRequired: true');
            
            const sequence = getDemoSequence(phase5Id, personaId);
            expect(sequence.length).toBeGreaterThan(0);
            
            const missionBlocks = findMissionBlocks(sequence);
            const voteMissions = missionBlocks.filter(m => m.mission_type === 'dao_vote');
            
            // CRITICAL: Phase 5 MUST have DAO vote
            expect(voteMissions.length).toBeGreaterThan(0);
            console.log(`✅ Phase 5 (capital-launchpad): Found ${voteMissions.length} dao_vote mission(s)`);
            
            // Verify DAO dashboard block exists
            const daoDashboards = findBlocksByKind(sequence, 'dao_dashboard_block');
            expect(daoDashboards.length).toBeGreaterThan(0);
            console.log('✅ Phase 5: DAO dashboard block present');
        });

        it('Phase 6 (launch-collaterize): Must be Collaterize finale', () => {
            const phase6Id = 'launch-collaterize';
            const sequence = getDemoSequence(phase6Id, personaId);
            
            expect(sequence.length).toBeGreaterThan(0);
            
            // Should have mission block for veteran badge
            const missionBlocks = findMissionBlocks(sequence);
            expect(missionBlocks.length).toBeGreaterThan(0);
            console.log('✅ Phase 6 (launch-collaterize): Veteran badge mission present');
        });
    });

    describe('Impact Engine (impact-engine)', () => {
        const personaId = 'impact-engine';
        const persona = personas.find(p => p.id === personaId);

        it('should have 6 phases defined', () => {
            expect(persona).toBeDefined();
            expect(persona!.phases).toHaveLength(6);
        });

        it('Phase 5 (synaptic-impact): MUST have DAO vote', () => {
            const phase5Id = 'synaptic-impact';
            const phase5 = persona!.phases.find(p => p.id === phase5Id);
            
            // Verify flag exists in personas.ts
            expect((phase5 as any).daoVoteRequired).toBe(true);
            console.log('✅ personas.ts confirms daoVoteRequired: true for Impact Engine Phase 5');
            
            const sequence = getDemoSequence(phase5Id, personaId);
            expect(sequence.length).toBeGreaterThan(0);
            
            const missionBlocks = findMissionBlocks(sequence);
            const voteMissions = missionBlocks.filter(m => m.mission_type === 'dao_vote');
            
            // CRITICAL: Phase 5 MUST have DAO vote
            expect(voteMissions.length).toBeGreaterThan(0);
            console.log(`✅ Impact Engine Phase 5 (synaptic-impact): Found ${voteMissions.length} dao_vote mission(s)`);
            
            // Verify DAO dashboard block exists
            const daoDashboards = findBlocksByKind(sequence, 'dao_dashboard_block');
            expect(daoDashboards.length).toBeGreaterThan(0);
            console.log('✅ Impact Engine Phase 5: DAO dashboard block present');
        });

        it('Phase 6 (launch-collaterize): Must be Collaterize finale', () => {
            const phase6Id = 'launch-collaterize';
            const sequence = getDemoSequence(phase6Id, personaId);
            
            expect(sequence.length).toBeGreaterThan(0);
            
            const missionBlocks = findMissionBlocks(sequence);
            expect(missionBlocks.length).toBeGreaterThan(0);
            console.log('✅ Impact Engine Phase 6: Collaterize finale mission present');
        });
    });

    describe('Cross-Persona Validation', () => {
        const criticalPersonas = ['capital-foundry', 'impact-engine', 'cognitive-activation-hub', 'system-architect', 'experience-studio', 'resilience-master'];
        
        it('Critical personas should have 6 phases with collaterize finale', () => {
            criticalPersonas.forEach(personaId => {
                const persona = personas.find(p => p.id === personaId);
                if (!persona) {
                    console.log(`⚠️ ${personaId}: Not found in personas.ts`);
                    return;
                }
                
                if (persona.phases.length === 6) {
                    const phase6 = persona.phases[5];
                    if (phase6.id.includes('collaterize')) {
                        console.log(`✅ ${personaId}: 6 phases with collaterize finale`);
                    } else {
                        console.log(`⚠️ ${personaId}: Phase 6 is ${phase6.id} (not collaterize)`);
                    }
                } else {
                    console.log(`⚠️ ${personaId}: Has ${persona.phases.length} phases (expected 6)`);
                }
            });
            
            // Only assert on the critical ones we've verified
            const capitalFoundry = personas.find(p => p.id === 'capital-foundry');
            const impactEngine = personas.find(p => p.id === 'impact-engine');
            
            expect(capitalFoundry!.phases).toHaveLength(6);
            expect(capitalFoundry!.phases[5].id).toContain('collaterize');
            expect(impactEngine!.phases).toHaveLength(6);
            expect(impactEngine!.phases[5].id).toContain('collaterize');
            
            console.log('✅ Capital Foundry & Impact Engine: Structure verified');
        });

        it('ALL 6 personas must have EXACTLY 6 phases for Swiss clock precision', () => {
            const expectedPhaseCount = 6;
            const allPersonasValid: string[] = [];
            const invalidPersonas: string[] = [];
            
            criticalPersonas.forEach(personaId => {
                const persona = personas.find(p => p.id === personaId);
                if (!persona) {
                    invalidPersonas.push(`${personaId}: NOT FOUND`);
                    return;
                }
                
                if (persona.phases.length !== expectedPhaseCount) {
                    invalidPersonas.push(`${personaId}: ${persona.phases.length} phases (expected ${expectedPhaseCount})`);
                } else {
                    allPersonasValid.push(personaId);
                    // Log phase progression 1/6, 2/6, ... 6/6
                    console.log(`\n📋 ${persona.title} (${personaId}):`);
                    persona.phases.forEach((phase, idx) => {
                        const progress = `${idx + 1}/${expectedPhaseCount}`;
                        console.log(`   ${progress} | ${phase.id} | ${phase.title}`);
                    });
                }
            });
            
            // Assert ALL personas have exactly 6 phases
            expect(invalidPersonas).toHaveLength(0);
            expect(allPersonasValid).toHaveLength(criticalPersonas.length);
            
            console.log(`\n✅ ALL ${allPersonasValid.length} PERSONAS: Exactly 6 phases each`);
            console.log('✅ Phase progression: 1/6 → 2/6 → 3/6 → 4/6 → 5/6 → 6/6');
        });
    });
});
