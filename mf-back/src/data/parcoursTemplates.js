/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const templates = {
    level_1_hub: {
        content: {
            mode: 'sequential',
            phases: [
                { phase_id: 1, agent: 'HubAgent', narrative_arc: { intro: 'Welcome to the Hub. We will begin by establishing your neural identity.' } },
                { phase_id: 2, agent: 'HubAgent', narrative_arc: { intro: 'Deep dive into Hub architecture and PDA derivation.' } },
                { phase_id: 3, agent: 'HubAgent', narrative_arc: { intro: 'Advanced Hub configurations and state checks.' } }
            ]
        }
    },
    level_2_defi: {
        content: {
            mode: 'sequential',
            phases: [
                { phase_id: 1, agent: 'DeFiAgent', narrative_arc: { intro: 'Welcome to DeFi. Lets analyze the bonding curves.' } },
                { phase_id: 2, agent: 'DeFiAgent', narrative_arc: { intro: 'Bonding curve stress testing and simulation.' } },
                { phase_id: 3, agent: 'DeFiAgent', narrative_arc: { intro: 'Liquidity strategies and risk assessment.' } }
            ]
        }
    },
    launch_nft: {
        content: {
            mode: 'parallel',
            phases: [
                { phase_id: 1, agent: 'NFTAgent', narrative_arc: { intro: 'NFT Launchpad initialization.' } },
                { phase_id: 2, agent: 'TokenAgent', narrative_arc: { intro: 'Token utility definition.' } },
                { phase_id: 3, agent: 'CommunityAgent', narrative_arc: { intro: 'Community engagement strategy.' } }
            ]
        }
    },
    default: {
        content: {
            mode: 'sequential',
            phases: [
                { phase_id: 1, agent: 'GuideAgent', narrative_arc: { intro: 'Welcome to MFAI and Journey Simulator.' } }
            ]
        }
    }
};

function loadTemplateForIntent(intent) {
    return templates[intent] || templates.default;
}

module.exports = { loadTemplateForIntent };
