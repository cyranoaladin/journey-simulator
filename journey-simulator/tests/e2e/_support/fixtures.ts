import { test as base } from '../helpers/hardening';

export const test = base.extend({
    // Hardening logic is now upstream.
    // Additional support fixtures can be added here.
});

export { expect, type Page, type Route, type APIRequestContext, type ConsoleMessage } from '@playwright/test';
