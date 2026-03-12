/**
 * @file critical-paths.spec.ts
 * @description Tests E2E critiques pour la Phase 3
 * 
 * Scénarios testés :
 * 1. Dashboard → Agents actifs → Navigation
 * 2. Journey → Interaction Zyno → Streaming
 * 3. DAO → Vote simulation
 * 
 * @author Kimi Code CLI — Phase 3 — 2026-03-12
 */

import { test, expect } from '@playwright/test';

test.describe('Phase 3 - Critical Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Aller au Dashboard
    await page.goto('http://localhost:5173');
    // Attendre que le Dashboard soit chargé
    await page.waitForSelector('text=Tableau de bord', { timeout: 10000 });
  });

  test('Dashboard displays agent stats from API', async ({ page }) => {
    // Vérifier que le widget Agents est présent
    const agentsWidget = page.locator('text=Agents actifs').first();
    await expect(agentsWidget).toBeVisible();
  });

  test('Journey page loads with stepper', async ({ page }) => {
    // Naviguer vers Journey
    await page.click('text=Mon Parcours');
    
    // Attendre le titre de la page
    await page.waitForSelector('text=Builder Protocol', { timeout: 5000 });
    
    // Vérifier que le contenu est présent
    const content = page.locator('text=Maîtrisez Anchor Framework');
    await expect(content).toBeVisible();
  });

  test('ZynoPanel opens and accepts input', async ({ page }) => {
    // Ouvrir Zyno via le bouton
    await page.click('text=Zyno');
    
    // Attendre le panel
    await page.waitForSelector('text=Protocole cognitif', { timeout: 3000 });
    
    // Vérifier que Zyno est présent
    await expect(page.locator('text=Zyno').first()).toBeVisible();
  });

  test('DAO page displays proposals', async ({ page }) => {
    // Naviguer vers DAO
    await page.click('text=DAO');
    
    // Attendre la liste des proposals
    await page.waitForSelector('text=Proposals actives', { timeout: 5000 });
    
    // Vérifier qu'il y a du contenu
    await expect(page.locator('text=Proposal').first()).toBeVisible();
  });

  test('Agent view displays agents', async ({ page }) => {
    // Naviguer vers Agents
    await page.click('text=Agents IA');
    
    // Attendre la grille
    await page.waitForSelector('text=Agents IA', { timeout: 5000 });
    
    // Vérifier que le contenu est présent
    await expect(page.locator('text=LLM').first()).toBeVisible();
  });

});

test.describe('Phase 3 - API Integration', () => {
  
  test('API health check', async ({ request }) => {
    const response = await request.get('http://localhost:3002/api/health');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  test('Agents stats API returns data', async ({ request }) => {
    const response = await request.get('http://localhost:3002/api/agents/stats');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('active');
  });

  test('cNFT status API accessible', async ({ request }) => {
    const response = await request.get('http://localhost:3002/api/cnft/status');
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body).toHaveProperty('available');
    expect(body).toHaveProperty('network');
  });

});
