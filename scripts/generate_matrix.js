const fs = require('fs');
const path = require('path');

const TRACKS_DIR = path.join(__dirname, 'mf-back/data/parcours_templates');
const OUTPUT_FILE = '/home/alaeddine/.gemini/antigravity/brain/8a342723-f0ad-43d0-becb-3c796c7b8401/MATRIX_COMPLETION_PROOF.json';

const tracks = [
    'hub_track.json',
    'foundry_track.json',
    'impact_track.json',
    'resilience_track.json',
    'dao_track.json',
    'web3legal_track.json'
];

const matrix = {
    timestamp: new Date().toISOString(),
    status: 'VERIFICATON_IN_PROGRESS',
    tracks: {}
};

let genericCount = 0;

tracks.forEach(trackFile => {
    const filePath = path.join(TRACKS_DIR, trackFile);
    if (!fs.existsSync(filePath)) {
        console.error(`Missing track: ${trackFile}`);
        return;
    }
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const trackName = content.id || trackFile;

    matrix.tracks[trackName] = {
        phases: []
    };

    const phases = content.phases || (content.content && content.content.phases) || [];

    if (phases.length > 0) {
        phases.forEach(phase => {
            // Check for generic content in narrative_arc if available, otherwise fallback to description
            const narrative = phase.narrative_arc || {};
            const isGeneric = (phase.description || '').includes('Generic') ||
                (narrative.intro || '').includes('Generic') ||
                (narrative.activity?.instructions || '').includes('Generic');

            if (isGeneric) genericCount++;

            matrix.tracks[trackFile] = matrix.tracks[trackFile] || { phases: [] };
            matrix.tracks[trackFile].phases.push({
                phase: phase.phase_id || phase.phase,
                title: phase.name || phase.title,
                agent: phase.agent,
                narrative_hydrated: !!phase.narrative_arc,
                delivery_defined: !!(phase.narrative_arc?.handoff),
                is_generic: isGeneric
            });
        });
    }
});

matrix.status = genericCount === 0 ? 'VALIDATION_SUCCESS' : 'GENERIC_CONTENT_DETECTED';
matrix.generic_count = genericCount;

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(matrix, null, 2));
console.log(`Matrix generated at ${OUTPUT_FILE}`);
console.log(`Status: ${matrix.status}`);
