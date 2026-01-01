/**
 * Empêche une promesse de s'exécuter indéfiniment.
 * @param {Promise} promise - La tâche à surveiller (ex: appel API Agent).
 * @param {number} timeoutMs - Délai max en millisecondes.
 * @param {string} context - Nom de l'agent ou de l'étape pour le log d'erreur.
 */
async function timeoutGuard(promise, timeoutMs, context = 'Unknown') {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[TIMEOUT] ${context} a dépassé la limite de ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = { timeoutGuard };
