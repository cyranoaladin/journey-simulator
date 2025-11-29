import { test, expect } from '@playwright/test';

test.describe('Resource Validation in Journey Steps', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication
        await page.route('**/user/profile', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: {
                        id: 'user-123',
                        name: 'Test User',
                        email: 'test@example.com',
                        role: 'user'
                    }
                })
            });
        });

        // Mock user progress
        await page.route('**/journey/user-progress', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    total_xp: 0,
                    completed_phases: [],
                    currentPersona: null
                })
            });
        });

        // Inject auth token
        await page.addInitScript(() => {
            localStorage.setItem('accessToken', 'mock-access-token');
            localStorage.setItem('userId', 'user-123');
        });
    });

    test('should display resources with valid URLs', async ({ page }) => {
        // Mock a journey step response with valid resources
        await page.route('**/journey/*/step', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    metadata: {
                        persona_id: 'capital-foundry',
                        journey_track: 'defi',
                        phase_id: 'learn',
                        language: 'fr'
                    },
                    ui_blocks: [
                        {
                            kind: 'resource_block',
                            id: 'res-1',
                            title: 'Ressources recommandées',
                            resources: [
                                {
                                    id: 'r1',
                                    label: 'Solana Documentation',
                                    description: 'Official Solana docs',
                                    url: 'https://docs.solana.com',
                                    resource_type: 'documentation',
                                    agent_owner: 'Zyno'
                                },
                                {
                                    id: 'r2',
                                    label: 'GitHub Repository',
                                    description: 'Example code',
                                    url: 'https://github.com/solana-labs/solana',
                                    resource_type: 'code',
                                    agent_owner: 'Builder'
                                }
                            ]
                        }
                    ],
                    agent_actions: [],
                    next_state: {}
                })
            });
        });

        // Navigate to journey and trigger a step
        await page.goto('/journeys/capital-foundry');
        await page.locator('button:has-text("Start / Continue")').click();

        // Wait for resources to load
        await expect(page.locator('text=Ressources recommandées')).toBeVisible({ timeout: 10000 });

        // Verify valid URLs are displayed and clickable
        // Verify valid URLs are displayed and clickable
        const solanaLink = page.locator('a:has-text("Open")').first();
        await expect(solanaLink).toBeVisible();
        await expect(solanaLink).toHaveAttribute('href', 'https://docs.solana.com');
    });

    test('should handle resources with invalid URLs gracefully', async ({ page }) => {
        // Mock a journey step response with sanitized resources (invalid URLs removed)
        await page.route('**/journey/*/step', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    metadata: {
                        persona_id: 'capital-foundry',
                        journey_track: 'defi',
                        phase_id: 'learn',
                        language: 'fr'
                    },
                    ui_blocks: [
                        {
                            kind: 'resource_block',
                            id: 'res-1',
                            title: 'Ressources recommandées',
                            resources: [
                                {
                                    id: 'r1',
                                    label: 'Valid Resource',
                                    description: 'This has a valid URL',
                                    url: 'https://solana.com',
                                    resource_type: 'documentation',
                                    agent_owner: 'Zyno'
                                },
                                {
                                    id: 'r2',
                                    label: 'Invalid Resource',
                                    description: 'This had an invalid URL that was removed',
                                    url: '', // Sanitized - URL was removed
                                    resource_type: 'documentation',
                                    agent_owner: 'Zyno'
                                }
                            ]
                        }
                    ],
                    agent_actions: [],
                    next_state: {}
                })
            });
        });

        await page.goto('/journeys/capital-foundry');
        await page.locator('button:has-text("Start / Continue")').click();

        // Wait for resources to load
        await expect(page.locator('text=Ressources recommandées')).toBeVisible({ timeout: 10000 });

        // Verify the resource with empty URL doesn't have an "Ouvrir" link
        const resourceBlocks = page.locator('text=Invalid Resource');
        await expect(resourceBlocks).toBeVisible();

        // The "Ouvrir" button should not be present for the invalid resource
        // We should only have one "Open" button (for the valid resource)
        const openButtons = page.locator('a:has-text("Open")');
        await expect(openButtons).toHaveCount(1);
    });

    test('should allow copying resource information even without URL', async ({ page }) => {
        // Mock a journey step response
        await page.route('**/journey/*/step', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    metadata: {
                        persona_id: 'capital-foundry',
                        journey_track: 'defi',
                        phase_id: 'learn',
                        language: 'fr'
                    },
                    ui_blocks: [
                        {
                            kind: 'resource_block',
                            id: 'res-1',
                            title: 'Ressources',
                            resources: [
                                {
                                    id: 'r1',
                                    label: 'Resource Without URL',
                                    description: 'Useful information',
                                    url: '',
                                    resource_type: 'note',
                                    agent_owner: 'Zyno'
                                }
                            ]
                        }
                    ],
                    agent_actions: [],
                    next_state: {}
                })
            });
        });

        await page.goto('/journeys/capital-foundry');
        await page.locator('button:has-text("Start / Continue")').click();

        // Wait for resources to load
        await expect(page.locator('text=Ressources')).toBeVisible({ timeout: 10000 });

        // Verify the copy button is still present
        // Verify the copy button is still present
        const copyButton = page.locator('button:has-text("Copy")');
        await expect(copyButton).toBeVisible();
    });
});
