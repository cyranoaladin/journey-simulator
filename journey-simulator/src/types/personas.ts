export interface Persona {
    id: string;
    name: string;
    description: string;
    icon?: string;
    color?: string;
}

export const PERSONAS: Persona[] = [
    {
        id: 'cognitive_activation_hub',
        name: 'Cognitive Activation Hub',
        description: 'Développement cognitif et activation de compétences',
        color: '#0ea5e9'
    },
    {
        id: 'capital_foundry',
        name: 'Capital Foundry',
        description: 'Financement et création de valeur',
        color: '#8b5cf6'
    },
    {
        id: 'system_architect',
        name: 'System Architect',
        description: 'Architecture technique et scalabilité',
        color: '#06b6d4'
    },
    {
        id: 'experience_studio',
        name: 'Experience Studio',
        description: 'UX/UI and user engagement',
        color: '#ec4899'
    },
    {
        id: 'impact_engine',
        name: 'Impact Engine',
        description: 'Gouvernance et DAOs',
        color: '#10b981'
    },
    {
        id: 'resilience_master',
        name: 'Resilience Master',
        description: 'Résilience système et gestion des risques',
        color: '#f59e0b'
    }
];
