/**
 * @file pythOracleService.ts
 * @description Service Pyth Network pour les prix on-chain des assets Solana.
 *
 * FONCTIONNEMENT :
 * - Requêtes vers hermes.pyth.network (fonctionne devnet ET mainnet)
 * - Cache TTL 30 secondes pour limiter les appels RPC
 * - Fallback automatique vers des prix statiques récents si le service est down
 * - Aucune clé API requise (service public Pyth Hermes)
 *
 * USAGE dans les agents :
 *   import { getAssetPrice, getAllPrices } from '../services/pythOracleService';
 *   const { price, source } = await getAssetPrice('SOL_USD');
 *   // source = 'pyth' | 'fallback'
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { PriceServiceConnection } from '@pythnetwork/price-service-client';

const IS_PYTH_ENABLED = process.env.PYTH_ENABLED !== 'false';

// ─── Feed IDs Pyth (source : https://pyth.network/price-feeds) ───────────────

const FEED_IDS = {
  SOL_USD:  '0xef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d',
  USDC_USD: '0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a',
  BTC_USD:  '0xe62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43',
  ETH_USD:  '0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace',
  JUP_USD:  '0x0a0408d619e9380abad35060f9192039ed5042fa6f82301d0e48bb52be830996',
} as const;

export type AssetSymbol = keyof typeof FEED_IDS;

/** Prix fallback en USD — mettre à jour manuellement toutes les semaines */
const FALLBACK_PRICES: Record<AssetSymbol, number> = {
  SOL_USD:  148.50,
  USDC_USD: 1.00,
  BTC_USD:  67_000,
  ETH_USD:  3_500,
  JUP_USD:  0.85,
};

export interface AssetPrice {
  symbol: AssetSymbol;
  priceUsd: number;
  confidenceUsd: number;
  publishTime: number;      // Unix timestamp
  ageSeconds: number;       // Âge de la donnée en secondes
  source: 'pyth' | 'fallback';
}

// ─── Cache ───────────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 30_000; // 30 secondes
const cache = new Map<AssetSymbol, { data: AssetPrice; expiresAt: number }>();

// ─── Client Pyth ─────────────────────────────────────────────────────────────

const pythClient = IS_PYTH_ENABLED
  ? new PriceServiceConnection('https://hermes.pyth.network', {
      priceFeedRequestConfig: { binary: true },
    })
  : null;

// ─── API publique ─────────────────────────────────────────────────────────────

/**
 * Récupère le prix actuel d'un asset depuis Pyth Network.
 * Utilise le cache (30s TTL) et le fallback automatiquement.
 */
export async function getAssetPrice(symbol: AssetSymbol): Promise<AssetPrice> {
  // 1. Vérifier le cache
  const cached = cache.get(symbol);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  // 2. Pyth désactivé → retourner fallback immédiatement
  if (!pythClient) {
    return makeFallback(symbol);
  }

  // 3. Requête Pyth
  try {
    const feeds = await pythClient.getLatestPriceFeeds([FEED_IDS[symbol]]);

    if (!feeds || feeds.length === 0) {
      throw new Error('Aucun feed retourné');
    }

    const feed = feeds[0];
    // Accepter les données jusqu'à 60 secondes d'ancienneté
    const priceData = feed.getPriceNoOlderThan(60);

    if (!priceData) {
      throw new Error('Données Pyth trop anciennes (> 60s)');
    }

    const exponent = priceData.expo;
    const multiplier = Math.pow(10, exponent);
    const priceUsd = Number(priceData.price) * multiplier;
    const confidenceUsd = Number(priceData.conf) * multiplier;
    const ageSeconds = Math.floor(Date.now() / 1000) - priceData.publishTime;

    const result: AssetPrice = {
      symbol,
      priceUsd: Math.max(priceUsd, 0), // Toujours positif
      confidenceUsd,
      publishTime: priceData.publishTime,
      ageSeconds,
      source: 'pyth',
    };

    cache.set(symbol, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
    return result;
  } catch (error) {
    console.warn(`[PythOracle] Échec pour ${symbol} — utilisation du fallback:`, (error as Error).message);
    return makeFallback(symbol);
  }
}

/**
 * Récupère les prix de tous les assets en une seule passe.
 * Les échecs individuels utilisent le fallback sans bloquer les autres.
 */
export async function getAllPrices(): Promise<Record<AssetSymbol, AssetPrice>> {
  const symbols = Object.keys(FEED_IDS) as AssetSymbol[];
  const results = await Promise.allSettled(symbols.map(getAssetPrice));

  return Object.fromEntries(
    symbols.map((symbol, i) => [
      symbol,
      results[i].status === 'fulfilled' ? results[i].value : makeFallback(symbol),
    ])
  ) as Record<AssetSymbol, AssetPrice>;
}

/**
 * Construit un résumé de marché pour les agents (DeFiAgent, TokenomicsAgent, InvestorAgent).
 */
export async function getMarketSummaryForAgents(): Promise<{
  prices: Record<AssetSymbol, AssetPrice>;
  summary: string;
  dataQuality: 'live' | 'mixed' | 'fallback';
}> {
  const prices = await getAllPrices();
  const liveSources = Object.values(prices).filter(p => p.source === 'pyth').length;
  const totalSources = Object.keys(prices).length;

  const dataQuality: 'live' | 'mixed' | 'fallback' =
    liveSources === totalSources ? 'live' :
    liveSources === 0 ? 'fallback' : 'mixed';

  const summary = [
    `SOL: $${prices.SOL_USD.priceUsd.toFixed(2)} (${prices.SOL_USD.source})`,
    `BTC: $${prices.BTC_USD.priceUsd.toLocaleString()} (${prices.BTC_USD.source})`,
    `ETH: $${prices.ETH_USD.priceUsd.toFixed(0)} (${prices.ETH_USD.source})`,
    `JUP: $${prices.JUP_USD.priceUsd.toFixed(4)} (${prices.JUP_USD.source})`,
    `Data quality: ${dataQuality}`,
  ].join(' | ');

  return { prices, summary, dataQuality };
}

// ─── Helpers privés ──────────────────────────────────────────────────────────

function makeFallback(symbol: AssetSymbol): AssetPrice {
  return {
    symbol,
    priceUsd: FALLBACK_PRICES[symbol],
    confidenceUsd: FALLBACK_PRICES[symbol] * 0.005, // 0.5% d'intervalle pour le fallback
    publishTime: Math.floor(Date.now() / 1000),
    ageSeconds: 0,
    source: 'fallback',
  };
}
