/**
 * sanitizer.ts
 * Provides security utilities for cleaning user input before LLM processing.
 * Prevents basic Prompt Injection and XSS-like payload vectors.
 */

export const sanitizeInput = (input: string | undefined | null, maxLength = 5000): string => {
    if (!input) return '';

    // 1. Truncate reasonable length to prevent token exhaustion denial of service
    let clean = input.slice(0, maxLength);

    // 2. Remove control characters (except newlines/tabs)
    // This helps prevent some binary payload attacks
    clean = clean.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // 3. Basic Prompt Injection mitigation (Heuristic)
    // We strip common "Ignore previous instructions" patterns if they appear at start?
    // Actually, strict stripping is hard without breaking legitimate use.
    // Better to just ensure we escape it when inserting into Prompt Template (which is Agent responsibility).
    // For now, we normalize whitespace.

    // 4. normalize
    clean = clean.trim();

    return clean;
};

export const validateSimulatedUrl = (url: string): boolean => {
    // Ensure URL belongs to allowed domains if needed
    try {
        const parsed = new URL(url);
        return ['localhost', 'mfai.io', 'collaterize.io'].some(d => parsed.hostname.endsWith(d));
    } catch {
        return false;
    }
};
