/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Placeholder for demo API functions

import { executeRequest } from './base';

export const demoApi = {
    loadDemoState: async (personaId: string): Promise<any> => {
        return executeRequest<any>('/journey/load-demo', {
            method: 'POST',
            body: JSON.stringify({ personaId }),
        });
    },
};
