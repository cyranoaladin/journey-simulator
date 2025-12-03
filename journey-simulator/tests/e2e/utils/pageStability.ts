import { Page } from '@playwright/test';

/**
 * Keeps Playwright interactions deterministic by neutralizing transitions and animations.
 */
export async function disablePageAnimations(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.setAttribute('data-test-style', 'disable-animations');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.001s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
        scroll-behavior: auto !important;
      }

      html {
        scroll-behavior: auto !important;
      }
    `;

    document.head.appendChild(style);
  });
}
