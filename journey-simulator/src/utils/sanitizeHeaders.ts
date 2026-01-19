/**
 * Sanitize HTTP headers to prevent secret leakage in logs.
 *
 * Supports:
 *  - Record<string, string | string[] | null | undefined>
 *  - Web Headers (Headers-like: has forEach)
 *  - Array of {name, value} pairs (duplicates aggregated)
 *
 * Policy (zero tolerance):
 *  - Redact known sensitive headers by name (case-insensitive).
 *  - Safety net: redact any value that looks like Bearer/Basic auth or JWT-like token,
 *    even if the header name is not in the sensitive list.
 *  - Ignore null/undefined values (keys omitted from output).
 *
 * Returns a NEW object (non-mutating). Keeps original key casing where possible.
 */

export type HeaderValue = string | string[] | null | undefined;
export type HeaderRecord = Record<string, HeaderValue>;
export type HeaderPair = { name: string; value: string };
export type HeaderPairs = HeaderPair[];

type HeadersLike = { forEach: (cb: (value: string, key: string) => void) => void };

const REDACTED = "[REDACTED]";

const SENSITIVE_HEADER_NAMES = new Set<string>([
    // Authorization families
    "authorization",
    "proxy-authorization",
    "x-forwarded-authorization",

    // API keys
    "x-api-key",
    "api-key",
    "x-api-token",
    "x-auth-token",

    // Cookies / session
    "cookie",
    "set-cookie",
    "x-session-token",
    "session-token",

    // CSRF
    "x-csrf-token",
    "csrf-token",

    // Refresh/access/id tokens
    "x-refresh-token",
    "refresh-token",
    "x-access-token",
    "access-token",
    "id-token",
    "x-id-token",
]);

function isHeadersLike(x: unknown): x is HeadersLike {
    return !!x && typeof x === "object" && typeof (x as any).forEach === "function";
}

function isHeaderPairs(x: unknown): x is HeaderPairs {
    if (!Array.isArray(x)) return false;
    return x.every(
        (v) =>
            v &&
            typeof v === "object" &&
            typeof (v as any).name === "string" &&
            typeof (v as any).value === "string"
    );
}

function looksLikeBearerOrBasic(value: string): boolean {
    const s = value.trim();
    return /^bearer\s+\S+/i.test(s) || /^basic\s+\S+/i.test(s);
}

function looksLikeJwt(value: string): boolean {
    const s = value.trim();
    // 3 base64url-ish segments separated by dots; intentionally permissive.
    return /^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/.test(s);
}

function coerceToRecord(input: unknown): HeaderRecord {
    // {name,value}[] -> aggregate duplicates into string[]
    if (isHeaderPairs(input)) {
        const out: HeaderRecord = {};
        for (const { name, value } of input) {
            const existing = out[name];
            if (existing == null) {
                out[name] = value;
            } else if (Array.isArray(existing)) {
                out[name] = [...existing, value];
            } else {
                out[name] = [existing, value];
            }
        }
        return out;
    }

    // Headers-like
    if (isHeadersLike(input)) {
        const out: HeaderRecord = {};
        (input as HeadersLike).forEach((value, key) => {
            out[key] = value;
        });
        return out;
    }

    // Plain object
    if (input && typeof input === "object") {
        return { ...(input as HeaderRecord) };
    }

    return {};
}

function redactValue(v: HeaderValue): string | string[] {
    if (Array.isArray(v)) return v.map(() => REDACTED);
    return REDACTED;
}

export function sanitizeHeaders(input: unknown): Record<string, string | string[]> {
    const src = coerceToRecord(input);
    const out: Record<string, string | string[]> = {};

    for (const [rawKey, rawValue] of Object.entries(src)) {
        //  ignore null/undefined: key omitted
        if (rawValue == null) continue;

        const keyLower = rawKey.toLowerCase();

        // (1) name-based redaction
        if (SENSITIVE_HEADER_NAMES.has(keyLower)) {
            out[rawKey] = redactValue(rawValue);
            continue;
        }

        // (2) safety net: redact Bearer/Basic/JWT-like patterns anywhere
        if (typeof rawValue === "string") {
            if (looksLikeBearerOrBasic(rawValue) || looksLikeJwt(rawValue)) {
                out[rawKey] = REDACTED;
                continue;
            }
            out[rawKey] = rawValue;
            continue;
        }

        // string[]
        const arr = rawValue;
        if (Array.isArray(arr)) {
            const needsRedaction = arr.some((s) => looksLikeBearerOrBasic(s) || looksLikeJwt(s));
            out[rawKey] = needsRedaction ? arr.map(() => REDACTED) : [...arr];
            continue;
        }

        // Fallback: should not happen, but keep safe
        out[rawKey] = String(rawValue);
    }

    return out;
}
