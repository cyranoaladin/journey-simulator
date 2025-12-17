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

    // In some browsers/edge-timings, document/head/documentElement can be null at document-start.
    // Retry until a mount point exists to avoid init-script exceptions that would break the app.
    const attach = () => {
      const target = document.head || document.documentElement;
      if (target) {
        target.appendChild(style);
        return;
      }
      setTimeout(attach, 0);
    };
    attach();
  });
}
