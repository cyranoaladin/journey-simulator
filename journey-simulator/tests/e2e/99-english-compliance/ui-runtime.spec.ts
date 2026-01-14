
import { test, expect } from '../fixtures/realModeTest';
import fs from 'fs';
import path from 'path';

test('UI Runtime English Compliance - Guide Page', async ({ page }) => {
    // Navigate to Guide page
    await page.goto('/guide');

    // Wait for content
    await expect(page.locator('h1')).toBeVisible();

    // Extract all text
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Check for French accents (runtime check)
    // Common accented chars: é, è, ê, à, â, î, ï, ô, ù, ç
    // We allow some if they are in names (e.g. "Alaeddine BEN RHOUMA" is fine, but "Déconnexion" is not).
    // But strict requirement says "absence de caractères accentués".
    // Names might have accents? "Kamel BEN RHOUMA" -> No accents. "Alaeddine" -> No. "Adem" -> No.
    // "BÉJA" -> E acute? "BEN RHOUMA"?
    // Let's assume strict english.

    const frenchAccentsRegex = /[éèêàâîïôöùûüç]/i;
    // Exclude known strings if necessary, but try strict first.

    // Create sample artifact
    const samplePath = path.resolve('artifacts/proof/lead12/ui_runtime_text_sample.txt');
    const sampleLines = bodyText.split('\n').filter(l => l.trim().length > 0).slice(0, 200);

    // Ensure dir exists
    fs.mkdirSync(path.dirname(samplePath), { recursive: true });
    fs.writeFileSync(samplePath, sampleLines.join('\n'));

    // Assert
    const linesWithAccents = sampleLines.filter(l => frenchAccentsRegex.test(l));
    if (linesWithAccents.length > 0) {
        console.error('Found potential French accents:', linesWithAccents);
        // Fail test if strictly required
        expect(linesWithAccents).toEqual([]);
    }
});
