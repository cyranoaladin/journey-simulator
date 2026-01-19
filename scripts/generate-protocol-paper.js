
const fs = require('fs');
const path = require('path');

const TRACKS_DIR = path.join(__dirname, '../mf-back/data/parcours_templates');
const OUTPUT_FILE = path.join(__dirname, '../PROTOCOL_PAPER_V1.md');

const tracks = [
    'hub_track.json',
    'foundry_track.json',
    'impact_track.json',
    'resilience_track.json',
    'dao_track.json',
    'web3legal_track.json'
];

let paperContent = `# MONEY FACTORY AI: PROTOCOL WHITE PAPER (V1)
**Date**: 2026-01-15
**Classification**: PUBLIC
**System**: GENESIS MAINNET

## ABSTRACT
Money Factory AI (MFAI) is an autonomous educational protocol designed to bridge the gap between Web2 developers and Web3 sovereignty. This document outlines the 6 Core Tracks and their pedagogical objectives.

---

## TABLE OF CONTENTS
1. [Cognitive Hub](#1-cognitive-hub)
2. [Capital Foundry](#2-capital-foundry)
3. [Impact Engine](#3-impact-engine)
4. [Resilience Master](#4-resilience-master)
5. [DAO Governance](#5-dao-governance)
6. [Web3 Legal](#6-web3-legal)

---

`;

tracks.forEach((trackFile, index) => {
    const filePath = path.join(TRACKS_DIR, trackFile);
    if (fs.existsSync(filePath)) {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const trackName = content.name;
        const phases = content.phases || (content.content && content.content.phases) || [];

        paperContent += `## ${index + 1}. ${trackName.toUpperCase()}\n`;
        paperContent += `**Description**: ${content.description}\n\n`;

        if (phases.length > 0) {
            paperContent += `### CURRICULUM ARCHITECTURE\n`;
            phases.forEach(p => {
                const phaseId = p.phase_id || p.phase;
                const title = p.name || p.title;
                const obj = p.objective || 'N/A';

                paperContent += `- **Phase ${phaseId}: ${title}**\n`;
                paperContent += `  - *Objective*: ${obj}\n`;
                if (p.narrative_arc && p.narrative_arc.activity) {
                    paperContent += `  - *Activity*: ${p.narrative_arc.activity.title}\n`;
                }
            });
        }
        paperContent += `\n---\n\n`;
    }
});

paperContent += `
## PROTOCOL CLOSURE
This document is virtually signed by the Zyno Orchestrator. The MFAI system ensures that every participant who completes these tracks has proven their sovereignty on-chain.

**DEPLOYMENT VERDICT**: READY_FOR_MAINNET
`;

fs.writeFileSync(OUTPUT_FILE, paperContent);
console.log(`Protocol Paper generated: ${OUTPUT_FILE}`);
