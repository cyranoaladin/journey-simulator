const sanitizeTimeline = (timeline = []) => {
    return timeline.map(entry => {
        const sanitized = { ...entry };
        const patterns = [
            /Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/gi,
            /eyJ[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}/gi,
            /sk-[a-zA-Z0-9\-_]{20,}/gi
        ];

        const clean = (val) => {
            if (typeof val !== 'string') return val;
            let result = val;
            patterns.forEach(p => {
                result = result.replace(p, '[SECRET_REDACTED]');
            });
            return result;
        };

        if (sanitized.prompt) sanitized.prompt = clean(sanitized.prompt);
        if (sanitized.summary) sanitized.summary = clean(sanitized.summary);
        if (sanitized.reasoning) sanitized.reasoning = clean(sanitized.reasoning);
        if (sanitized.action) sanitized.action = clean(sanitized.action);

        return sanitized;
    });
};

module.exports = { sanitizeTimeline };
