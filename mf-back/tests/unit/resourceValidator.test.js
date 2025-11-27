const { isValidUrl, sanitizeResourceBlock, validateAndSanitizeResponse } = require('../../utils/resourceValidator');
const axios = require('axios');

jest.mock('axios');

describe('Resource Validator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should validate URL format', () => {
        expect(isValidUrl('https://solana.com')).toBe(true);
        expect(isValidUrl('not-a-url')).toBe(false);
    });

    it('should sanitize resource blocks with reachable URLs', async () => {
        // Mock successful HEAD request
        axios.head.mockResolvedValue({ status: 200 });

        const block = {
            kind: 'resource_block',
            resources: [
                { label: 'Good', url: 'https://solana.com' }
            ]
        };

        const sanitized = await sanitizeResourceBlock(block);
        expect(sanitized.resources[0].url).toBe('https://solana.com');
    });

    it('should fallback to Google search for unreachable URLs', async () => {
        // Mock failed HEAD and GET requests
        axios.head.mockRejectedValue(new Error('Network Error'));
        axios.get.mockRejectedValue(new Error('Network Error'));

        const block = {
            kind: 'resource_block',
            resources: [
                { label: 'Bad', url: 'https://bad-site.com', resource_type: 'article' }
            ]
        };

        const sanitized = await sanitizeResourceBlock(block);
        expect(sanitized.resources[0].url).toContain('google.com/search');
        expect(sanitized.resources[0].status).toBe('unreachable');
    });

    it('should sanitize full response', async () => {
        axios.head.mockResolvedValue({ status: 200 });

        const response = {
            ui_blocks: [
                { kind: 'text_block', text: 'Hello' },
                {
                    kind: 'resource_block',
                    resources: [{ label: 'Good', url: 'https://solana.com' }]
                }
            ]
        };

        const sanitized = await validateAndSanitizeResponse(response);
        expect(sanitized.ui_blocks[1].resources[0].url).toBe('https://solana.com');
    });
});
