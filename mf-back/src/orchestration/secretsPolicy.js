/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const REQUIRED_PROD = ['OPENAI_API_KEY'];
const OPTIONAL_DEV = ['OPENAI_API_KEY'];

function evaluate({ env = process.env.NODE_ENV || 'DEV', mode = 'DEV' } = {}) {
  const isProd = (env || '').toUpperCase() === 'PROD' || mode.toUpperCase() === 'PROD';
  const missing = [];
  const warnings = [];

  const check = (key, required) => {
    const val = process.env[key];
    if (!val || !val.trim()) {
      if (required) missing.push(key);
      else warnings.push(`missing_${key.toLowerCase()}`);
    }
  };

  REQUIRED_PROD.forEach((k) => check(k, isProd));
  OPTIONAL_DEV.forEach((k) => {
    if (!isProd) check(k, false);
  });

  let status = 'OK';
  if (missing.length > 0 && isProd) status = 'BLOCK';
  else if (missing.length > 0 || warnings.length > 0) status = 'WARN';

  const decision = {
    status,
    missing,
    warnings,
    env: env || 'DEV',
    mode: mode || env || 'DEV',
  };
  return decision;
}

module.exports = { evaluate };
