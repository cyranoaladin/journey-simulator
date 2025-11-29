import { FileText, BookOpen, Layout, ClipboardList } from 'lucide-react';

export interface Resource {
    id: string;
    title: string;
    type: 'PDF' | 'Guide' | 'Template' | 'Playbook';
    duration: string;
    description: string;
    tags: string[];
    url: string;
}

export const resources: Resource[] = [
    {
        id: 'blueprint',
        title: 'MFAI System Blueprint',
        type: 'PDF',
        duration: '18 min',
        description: 'Complete architecture of the Money Factory AI protocol and Zyno agents.',
        tags: ['Architecture', 'Protocol', 'Foundations'],
        url: '/knowledge-vault/mfai-system-blueprint.pdf'
    },
    {
        id: 'whitepaper',
        title: 'Protocol Whitepaper (EN)',
        type: 'PDF',
        duration: '22 min',
        description: 'Strategic vision, economic primitives, and MFAI deployment roadmaps.',
        tags: ['Strategy', 'Tokenomics', 'Protocol'],
        url: '/knowledge-vault/mfai-protocol-whitepaper-en.pdf'
    },
    {
        id: 'activation-guide',
        title: 'Web2 ➝ Web3 Activation Guide',
        type: 'Guide',
        duration: '14 min',
        description: 'Detailed pathway to transform a Web2 team into autonomous Web3 builders.',
        tags: ['Onboarding', 'Execution', 'Playbook'],
        url: '/knowledge-vault/web2-to-web3-activation-guide.pdf'
    },
    {
        id: 'token-template',
        title: 'Token Strategy Sprint Template',
        type: 'Template',
        duration: '9 min',
        description: 'Notion template to frame supply, utility, and token distribution scenarios.',
        tags: ['Tokenomics', 'Templates'],
        url: '/knowledge-vault/token-strategy-sprint-template.zip'
    },
    {
        id: 'dao-kit',
        title: 'DAO Launch Starter Kit',
        type: 'Playbook',
        duration: '11 min',
        description: 'Operational checklist to register voters, quorum, and DAO roles.',
        tags: ['DAO', 'Governance', 'Execution'],
        url: '/knowledge-vault/dao-launch-starter-kit.pdf'
    },
    {
        id: 'pitch-framework',
        title: 'Pitch Deck Narrative Framework',
        type: 'Template',
        duration: '8 min',
        description: 'Slide-by-slide structure to showcase MFAI impact and agent KPIs.',
        tags: ['Fundraising', 'Storytelling'],
        url: '/knowledge-vault/pitch-deck-narrative-framework.pptx'
    },
    {
        id: 'rag-playbook',
        title: 'RAG Ingestion Playbook',
        type: 'Guide',
        duration: '16 min',
        description: 'Procedure to prepare, vectorize, and feed cognitive mesh documents.',
        tags: ['RAG', 'Agents', 'Data'],
        url: '/knowledge-vault/rag-ingestion-playbook.pdf'
    },
    {
        id: 'feedback-loops',
        title: 'Mission Feedback Loops',
        type: 'Guide',
        duration: '7 min',
        description: 'AEPO/AECO framework to capture, score, and recycle builder feedback.',
        tags: ['Analytics', 'Agents', 'Playbook'],
        url: '/knowledge-vault/mission-feedback-loops.pdf'
    }
];

export const getResourceIcon = (type: Resource['type']) => {
    switch (type) {
        case 'PDF': return FileText;
        case 'Guide': return BookOpen;
        case 'Template': return Layout;
        case 'Playbook': return ClipboardList;
        default: return FileText;
    }
};
