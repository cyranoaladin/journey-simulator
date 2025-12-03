
const fs = require('fs');
const path = require('path');

const baseDir = '/home/alaeddine/Documents/journey_mfai_back_front/journey-simulator/public/images/nfts';

const personas = {
    'capital-foundry': {
        colors: ['#10B981', '#14B8A6'], // Emerald to Teal
        phases: [
            'capital-discovery',
            'program-forge',
            'oracle-integration',
            'risk-command',
            'capital-launchpad',
            'launch-collaterize'
        ]
    },
    'system-architect': {
        colors: ['#8B5CF6', '#6366F1'], // Purple to Indigo
        phases: [
            'architecture-scan',
            'depin-studio',
            'onchain-ai',
            'systems-hardening',
            'synaptic-rollout',
            'launch-collaterize'
        ]
    },
    'experience-studio': {
        colors: ['#F43F5E', '#D946EF'], // Rose to Fuchsia
        phases: [
            'experience-discovery',
            'nft-systems-lab',
            'gameplay-lab',
            'ux-elevation',
            'experience-launch',
            'launch-collaterize'
        ]
    },
    'impact-engine': {
        colors: ['#F59E0B', '#84CC16'], // Amber to Lime
        phases: [
            'impact-charter',
            'dao-design',
            'philanthropy-protocols',
            'identity-reputation',
            'synaptic-impact',
            'launch-collaterize'
        ]
    },
    'resilience-master': {
        colors: ['#64748B', '#0891B2'], // Slate to Cyan
        phases: [
            'security-baseline',
            'exploit-hunt',
            'defense-systems',
            'incident-response',
            'redblue-evolution',
            'launch-collaterize'
        ]
    }
};

function generateSVG(title, color1, color2) {
    return `<svg width="500" height="500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#grad)" rx="20" ry="20" />
  <circle cx="250" cy="250" r="150" fill="none" stroke="white" stroke-width="10" opacity="0.3" />
  <path d="M250 150 L350 350 L150 350 Z" fill="none" stroke="white" stroke-width="5" opacity="0.2" />
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="white" font-weight="bold" opacity="0.9">PROOF OF SKILL</text>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="white" font-weight="bold">${title.replace(/-/g, ' ').toUpperCase()}</text>
  <text x="50%" y="90%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="white" opacity="0.6">MONEY FACTORY AI</text>
</svg>`;
}

Object.entries(personas).forEach(([persona, data]) => {
    const dir = path.join(baseDir, persona);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }

    data.phases.forEach(phase => {
        const svgContent = generateSVG(phase, data.colors[0], data.colors[1]);
        const filePath = path.join(dir, `${phase}.svg`);
        fs.writeFileSync(filePath, svgContent);
        console.log(`Generated: ${filePath}`);
    });
});
