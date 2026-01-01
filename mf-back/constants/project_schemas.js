const numberLikeToFloat = (value) => {
  if (value === null || value === undefined) return null;
  const normalized = String(value).replace(/[^0-9.,-]/g, '').replace(/[\s,]+/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const PROJECT_SCHEMA_DEFAULTS = {
  supply: null,
  price: null,
  currency: 'USD',
  budget: null,
  marketCap: null,
};

const normalizeProjectSpecs = (specs = {}) => {
  const supply =
    numberLikeToFloat(
      specs.supply
      ?? specs.collection_strategy?.supply
      ?? specs.token_model?.supply_cap
      ?? specs.total_supply
    );

  const price =
    numberLikeToFloat(
      specs.price
      ?? specs.collection_strategy?.price
      ?? specs.nftPrice
      ?? specs.tokenPrice
    );

  const currency =
    specs.currency
    ?? specs.collection_strategy?.currency
    ?? PROJECT_SCHEMA_DEFAULTS.currency;

  const budget = numberLikeToFloat(specs.budget);
  const marketCap = numberLikeToFloat(specs.marketCap ?? specs.initialMarketCap);

  return {
    ...PROJECT_SCHEMA_DEFAULTS,
    supply,
    price,
    currency,
    budget,
    marketCap,
  };
};

module.exports = {
  PROJECT_SCHEMA_DEFAULTS,
  normalizeProjectSpecs,
};
