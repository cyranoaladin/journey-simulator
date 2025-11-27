const { URL } = require('url');
const axios = require('axios');

const ALLOWED_DOMAINS = [
    'mfai.app',
    'moneyfactory.ai',
    'solana.com',
    'github.com',
    'youtube.com',
    'medium.com',
    'docs.solana.com',
    'spl.solana.com',
    'explorer.solana.com',
    'solscan.io',
    'phantom.app',
    'sqds.io',
    'realms.today',
    'orca.so',
    'jup.ag',
    'metaplex.com',
    'anchor-lang.com',
    'react.dev',
    'developer.mozilla.org',
    'npmjs.com',
    'stackoverflow.com',
    'twitter.com',
    'x.com',
    'discord.com',
    'discord.gg',
    't.me',
    'telegram.org',
    'openai.com',
    'ai.gov',
    'ethereum.org',
    'polygon.technology',
    'arbitrum.io',
    'optimism.io',
    'chain.link',
    'uniswap.org',
    'aave.com',
    'compound.finance',
    'makerdao.com',
    'yearn.finance',
    'sushi.com',
    'pancakeswap.finance',
    'raydium.io',
    'wormholebridge.com',
    'chainalysis.com',
    'messari.io',
    'coinmarketcap.com',
    'coingecko.com',
    'defillama.com',
    'dappradar.com',
    'zerion.io',
    'rainbow.me',
    'metamask.io',
    'trustwallet.com',
    'brave.com',
    'firefox.com',
    'chrome.com',
    'wikipedia.org',
    'wikidata.org',
    'researchgate.net',
    'arxiv.org',
    'ieee.org',
    'acm.org',
    'springer.com',
    'elsevier.com',
    'nature.com',
    'science.org',
    '101blockchains.com',
    '1kosmos.com',
    '21shares.com',
    'alchemy.com',
    'ankr.com',
    'antiersolutions.com',
    'arxiv.org',
    'atlas21.com',
    'blaize.tech',
    'blockchainappfactory.com',
    'blockwall.vc',
    'coinmarketcap.com',
    'coingecko.com',
    'defillama.com',
    'ethereum.org',
    'github.com',
    'helius.dev',
    'ipfs.io',
    'jup.ag',
    'light-protocol.com',
    'mantrachain.io',
    'metaplex.com',
    'moralis.com',
    'nodereal.io',
    'npmjs.com',
    'osw.im',
    'polygon.technology',
    'polygon.io',
    'quillaudits.com',
    'quicknode.com',
    'rust-lang.org',
    'rustlings.dev',
    'solana.com',
    'solana.org',
    'solscan.io',
    'squads.xyz',
    'solaritylabs.com',
    'solicy.net',
    'solscan.io',
    'squads.so',
    'stakecube.net',
    'superteam.fun',
    'swissborg.com',
    't.me',
    'taprootassets.org',
    'tensor.foundation',
    'tensor.trade',
    'triton.one',
    'uniswap.org',
    'web3auth.io',
    'web3js.org',
    'wormhole.com',
    'wormholebridge.com',
    'youtube.com',
    'zama.ai',
    'zilliqa.com',
    'zkproof.org',
    'zksync.io',
    '1inch.io',
    'aave.com',
    'airswap.io',
    'balancer.fi',
    'compound.finance',
    'convexfinance.com',
    'curve.fi',
    'makerdao.com',
    'olympusdao.finance',
    'yearn.finance',
    'dydx.exchange',
    'gmx.io',
    'perpetual.io',
    'synthetix.io',
    'uniswap.org',
    'sushiswap.fi',
    'camelot.exchange',
    'dodoex.io',
    'kyberswap.com',
    'pancakeswap.finance',
    'traderjoe.xyz',
    'pangolin.exchange',
    'spiritswap.finance',
    'spookyswap.finance',
    'solarbeam.io',
    'morphex.finance',
    'aldrin.com',
    'raydium.io',
    'orca.so',
    'saber.so',
    'jupiter.exchange',
    'phoenix.trade',
    'mango.markets',
    'drift.trade',
    'friktion.fi',
    'larix.finance',
    'tulip.garden',
    'solend.fi',
    'solfarm.fi',
    'port.finance',
    'cashio.app',
    'solrise.finance',
    'symmetry.finance',
    'cope.fan',
    'sunny.ag',
    'soluna.finance',
    'solyard.finance',
    'solanium.io',
    'solcats.finance',
    'soulswap.finance',
    'solape.finance',
    'soltato.finance',
    'solstarter.finance',
    'solpad.finance',
    'solx.finance',
    'solyard.finance',
    'solscale.finance',
    'solchicks.io',
    'solcity.finance',
    'solcrow.finance',
    'solcats.finance',
    'solpad.io',
    'solana.foundation',
    'solana.be',
    'solana.fm',
    'solana.zone',
    'solana.tools',
    'solanacollective.org',
    'solanaeducation.org',
    'solana.study',
    'solana.network',
    'solana.foundation',
    'solana.foundation',
    'solana.foundation',
    'solana.foundation',
    'solana.foundation',
    'solana.foundation'
];

/**
 * Validates a URL (basic format check).
 * @param {string} urlString - The URL to validate.
 * @returns {boolean} - True if valid, false otherwise.
 */
function isValidUrl(urlString) {
    if (!urlString || typeof urlString !== 'string') return false;
    try {
        const url = new URL(urlString);
        return (url.protocol === 'http:' || url.protocol === 'https:');
    } catch (e) {
        return false;
    }
}

/**
 * Checks if a URL is from a trusted domain (optional security layer).
 * @param {string} urlString - The URL to check.
 * @returns {boolean} - True if trusted, false otherwise.
 */
function isTrustedDomain(urlString) {
    try {
        const url = new URL(urlString);
        return ALLOWED_DOMAINS.some(domain => url.hostname.endsWith(domain));
    } catch (e) {
        return false;
    }
}

/**
 * Checks if a URL is reachable (HTTP 200-399).
 * @param {string} url - The URL to check.
 * @returns {Promise<boolean>} - True if reachable, false otherwise.
 */
async function checkUrlReachability(url) {
    console.log(`[ResourceValidator] Checking: ${url}`);
    try {
        // First try HEAD request
        await axios.head(url, {
            timeout: 3000, // 3 seconds timeout
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400,
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyFactoryAI/1.0; +http://moneyfactory.ai)' }
        });
        console.log(`[ResourceValidator] HEAD success for ${url}`);
        return true;
    } catch (error) {
        console.log(`[ResourceValidator] HEAD failed for ${url}: ${error.message}`);
        // If HEAD fails, try GET (some servers block HEAD or return 405 Method Not Allowed)
        try {
            const response = await axios.get(url, {
                timeout: 5000, // 5 seconds timeout for GET
                maxRedirects: 5,
                validateStatus: (status) => status >= 200 && status < 400,
                headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyFactoryAI/1.0; +http://moneyfactory.ai)' }
            });

            // Soft 404 check: analyze content for common error messages
            if (typeof response.data === 'string') {
                const lowerData = response.data.toLowerCase().slice(0, 5000); // Check first 5000 chars
                if (lowerData.includes('<title>404') ||
                    lowerData.includes('page not found') ||
                    lowerData.includes('page introuvable') ||
                    lowerData.includes('error 404') ||
                    lowerData.includes('not found') && lowerData.includes('title')) {
                    console.warn(`[ResourceValidator] Soft 404 detected for ${url}`);
                    return false;
                }
            }

            console.log(`[ResourceValidator] GET success for ${url}`);
            return true;
        } catch (e) {
            console.warn(`[ResourceValidator] URL unreachable: ${url} - ${e.message}`);
            return false;
        }
    }
}

/**
 * Generates a fallback URL for a resource (Google search).
 * @param {object} resource - The resource object.
 * @returns {string} - A fallback search URL.
 */
function generateFallbackUrl(resource) {
    const query = `${resource.label || ''} ${resource.resource_type || ''}`.trim();
    return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}

/**
 * Sanitizes a resource block by validating URLs.
 * @param {object} block - The resource block to sanitize.
 * @returns {Promise<object>} - The sanitized block.
 */
async function sanitizeResourceBlock(block) {
    if (block.kind !== 'resource_block' || !Array.isArray(block.resources)) {
        return block;
    }

    const sanitizedResources = await Promise.all(block.resources.map(async resource => {
        // If URL is missing or empty, generate a fallback
        if (!resource.url || resource.url.trim() === '') {
            const fallbackUrl = generateFallbackUrl(resource);
            console.warn(`[ResourceValidator] Missing URL for resource "${resource.label}". Generated fallback: ${fallbackUrl}`);
            return { ...resource, url: fallbackUrl };
        }

        // If URL is invalid format, generate a fallback
        if (!isValidUrl(resource.url)) {
            const fallbackUrl = generateFallbackUrl(resource);
            console.warn(`[ResourceValidator] Invalid URL format: ${resource.url}. Generated fallback: ${fallbackUrl}`);
            return { ...resource, url: fallbackUrl };
        }

        // Check reachability
        const isReachable = await checkUrlReachability(resource.url);
        if (!isReachable) {
            const fallbackUrl = generateFallbackUrl(resource);
            console.warn(`[ResourceValidator] URL unreachable: ${resource.url}. Generated fallback: ${fallbackUrl}`);
            return { ...resource, url: fallbackUrl, original_url: resource.url, status: 'unreachable' };
        }

        // Block untrusted domains by clearing the URL
        if (!isTrustedDomain(resource.url)) {
            console.info(`[ResourceValidator] Untrusted domain detected: ${resource.url}. Clearing URL for security.`);
            return { ...resource, url: '' };
        }

        return resource;
    }));

    return { ...block, resources: sanitizedResources };
}

/**
 * Validates and sanitizes all UI blocks in a response.
 * @param {object} response - The JourneyStepResponse.
 * @returns {Promise<object>} - The sanitized response.
 */
async function validateAndSanitizeResponse(response) {
    if (!response || !response.ui_blocks || !Array.isArray(response.ui_blocks)) {
        return response;
    }

    const sanitizedBlocks = await Promise.all(response.ui_blocks.map(async block => {
        if (block.kind === 'resource_block') {
            return await sanitizeResourceBlock(block);
        }
        return block;
    }));

    return { ...response, ui_blocks: sanitizedBlocks };
}

module.exports = {
    isValidUrl,
    isTrustedDomain,
    generateFallbackUrl,
    sanitizeResourceBlock,
    validateAndSanitizeResponse
};
