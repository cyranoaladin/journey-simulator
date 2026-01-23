/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Prevents a promise from running indefinitely.
 * @param {Promise} promise - The task to monitor (e.g., Agent API call).
 * @param {number} timeoutMs - Max timeout in milliseconds.
 * @param {string} context - Agent or step name for error logging.
 */
async function timeoutGuard(promise, timeoutMs, context = 'Unknown') {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`[TIMEOUT] ${context} exceeded limit of ${timeoutMs}ms`));
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
