export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Helper sécurisé pour les appels API
 * Injecte automatiquement le token Bearer s'il est présent
 */
export async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // 1. Récupérer le token
  const token = localStorage.getItem('token');

  // 2. Construire les headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };

  // 3. Exécuter la requête
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 4. Gestion globale des erreurs
  if (!response.ok) {
    if (response.status === 401) {
      console.warn('⚠️ Session expirée ou token invalide');
    }
    
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Ignorer
    }
    
    throw new Error(errorMessage);
  }

  // 5. Retourner le JSON (ou vide si 204)
  if (response.status === 204) return {} as T;
  return response.json();
}

// --- COUCHE DE COMPATIBILITÉ (Pour ne pas casser le code existant) ---

export const api = {
  request,
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};

// Types "Placeholder" pour satisfaire le compilateur TypeScript
// (On utilise 'any' temporairement pour débloquer le build rapidement)
export type LoginResponse = any;
export type DaoConfigResponse = any;
export type DaoProposal = any;
export type DaoVoter = any;
export type AgentScoreboardEntry = any;
export type RagDocument = any;
export type JourneyResponse = any;
