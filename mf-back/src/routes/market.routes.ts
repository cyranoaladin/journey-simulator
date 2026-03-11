/**
 * @file market.routes.ts
 * @description Endpoints pour les données de marché Pyth.
 * GET /api/market/prices       → tous les prix
 * GET /api/market/prices/:symbol → prix d'un asset spécifique
 *
 * @author Kimi Code CLI — 2026-03-11
 */

import { Router } from 'express';
import { getAssetPrice, getAllPrices, AssetSymbol } from '../services/pythOracleService';

const router = Router();

router.get('/prices', async (_req, res) => {
  try {
    const prices = await getAllPrices();
    res.json({ success: true, data: prices, timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch prices' });
  }
});

router.get('/prices/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase() as AssetSymbol;
  try {
    const price = await getAssetPrice(symbol);
    res.json({ success: true, data: price });
  } catch (error) {
    res.status(404).json({ success: false, error: `Unknown symbol: ${symbol}` });
  }
});

export default router;
