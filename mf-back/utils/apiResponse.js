/**
 * API Response Helpers
 * Standardise les formats de réponse JSON pour assurer la cohérence frontend
 *
 * Format standardisé:
 * - Success: { success: true, data: any, ...meta }
 * - Error: { success: false, error: string, ...details }
 */

/**
 * Retourne une réponse d'erreur standardisée
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Message d'erreur principal
 * @param {object} details - Détails additionnels (optional)
 * @returns {object} Express response
 */
function errorResponse(res, statusCode, message, details = {}) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    ...details
  });
}

/**
 * Retourne une réponse de succès standardisée
 * @param {object} res - Express response object
 * @param {any} data - Données à retourner
 * @param {object} meta - Métadonnées additionnelles (optional)
 * @returns {object} Express response
 */
function successResponse(res, data, meta = {}) {
  return res.json({
    success: true,
    data,
    ...meta
  });
}

/**
 * Wrapper pour gérer les erreurs async dans les contrôleurs
 * Évite les try/catch répétitifs
 * @param {function} fn - Async function handler
 * @returns {function} Express middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = {
  errorResponse,
  successResponse,
  asyncHandler
};
