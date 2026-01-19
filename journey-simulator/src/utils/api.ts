/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { API_BASE_URL, SOLANA_API_BASE_URL } from './api-modules/base';
import { authApi } from './api-modules/auth';
import { journeyApi } from './api-modules/journey';
import { demoApi } from './api-modules/demo';
import { web3Api } from './api-modules/web3';
import { resourcesApi } from './api-modules/resources';

export * from './api-modules/base';
export * from './api-modules/auth';
export * from './api-modules/journey';
export * from './api-modules/web3';
export * from './api-modules/resources';

// Unified API Object (Facade)
// Reduces cognitive complexity by delegating to specialized modules
export const api = {
  ...authApi,
  ...journeyApi,
  ...demoApi,
  ...web3Api,
  ...resourcesApi,
} as (typeof authApi & typeof journeyApi & typeof demoApi & typeof web3Api & typeof resourcesApi);

export { API_BASE_URL, SOLANA_API_BASE_URL };
