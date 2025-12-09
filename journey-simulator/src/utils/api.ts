export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Helper sécurisé pour les appels API
 * Injecte automatiquement le token Bearer s'il est présent
 */
export async function request(endpoint: string, options: RequestInit = {}) {
  // 1. Récupérer le token (localStorage est le standard pour ce projet)
  const token = localStorage.getItem('token');

  // 2. Construire les headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    // Injecter le token seulement s'il existe
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
    // Si 401 (Non autorisé), on pourrait rediriger vers le login ici
    if (response.status === 401) {
      console.warn('⚠️ Session expirée ou token invalide');
    }
    
    // Tenter de lire le message d'erreur JSON
    let errorMessage = `Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      // Ignorer si ce n'est pas du JSON
    }
    
    throw new Error(errorMessage);
  }

  // 5. Retourner le JSON (ou vide si 204)
  if (response.status === 204) return null;
  return response.json();
}
