import { tokenStore } from './tokenStore';

export function isDemoSession(): boolean {
  return tokenStore.getAccessToken() === 'demo-token';
}


