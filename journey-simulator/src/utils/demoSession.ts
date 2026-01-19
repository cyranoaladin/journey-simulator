/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { tokenStore } from './tokenStore';

export function isDemoSession(): boolean {
  return tokenStore.getAccessToken() === 'demo-token';
}


