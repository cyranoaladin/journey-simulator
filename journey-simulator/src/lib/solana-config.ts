/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * Shared Solana Configuration Module
 *
 * Centralizes wallet configuration, RPC endpoints, and network settings
 * Used by both journey-simulator (frontend) and web (Next.js portal)
 */

import type { Cluster } from '@solana/web3.js';

// Network configuration
export const SOLANA_NETWORK: Cluster = (process.env.VITE_SOLANA_NETWORK as Cluster) || 'devnet';

const clusterRpcUrl = (cluster: Cluster): string => {
    switch (cluster) {
        case 'mainnet-beta':
            return 'https://api.mainnet-beta.solana.com';
        case 'testnet':
            return 'https://api.testnet.solana.com';
        case 'devnet':
        default:
            return 'https://api.devnet.solana.com';
    }
};

// RPC Endpoints
export const getRPCEndpoint = (): string => {
    // Priority: custom RPC > environment variable > default cluster URL
    if (process.env.VITE_SOLANA_RPC_URL) {
        return process.env.VITE_SOLANA_RPC_URL;
    }

    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
        return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }

    return clusterRpcUrl(SOLANA_NETWORK);
};

// Create connection instance
export const createConnection = async () => {
    const endpoint = getRPCEndpoint();
    const { Connection } = await import('@solana/web3.js');
    return new Connection(endpoint, 'confirmed');
};

// Wallet configuration
export const SUPPORTED_WALLETS = [
    'Phantom',
    'Backpack',
    'Solflare',
    'Torus',
    'Ledger'
] as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[number];

// Network display names
export const NETWORK_NAMES: Record<Cluster, string> = {
    'devnet': 'Devnet',
    'testnet': 'Testnet',
    'mainnet-beta': 'Mainnet Beta'
};

// Explorer URLs
export const getExplorerUrl = (signature: string, cluster: Cluster = SOLANA_NETWORK): string => {
    const baseUrl = 'https://explorer.solana.com';
    const clusterParam = cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : '';
    return `${baseUrl}/tx/${signature}${clusterParam}`;
};

export const getAddressExplorerUrl = (address: string, cluster: Cluster = SOLANA_NETWORK): string => {
    const baseUrl = 'https://explorer.solana.com';
    const clusterParam = cluster !== 'mainnet-beta' ? `?cluster=${cluster}` : '';
    return `${baseUrl}/address/${address}${clusterParam}`;
};

// Transaction confirmation settings
export const TX_CONFIRMATION_TIMEOUT = 60000; // 60 seconds
export const TX_CONFIRMATION_COMMITMENT = 'confirmed';

// Airdrop settings (devnet only)
export const AIRDROP_AMOUNT = 1_000_000_000; // 1 SOL in lamports

// Helper to check if we're on devnet
export const isDevnet = (): boolean => SOLANA_NETWORK === 'devnet';
export const isMainnet = (): boolean => SOLANA_NETWORK === 'mainnet-beta';

// Configuration summary
export const getSolanaConfig = () => ({
    network: SOLANA_NETWORK,
    networkName: NETWORK_NAMES[SOLANA_NETWORK],
    rpcEndpoint: getRPCEndpoint(),
    supportedWallets: SUPPORTED_WALLETS,
    isDevnet: isDevnet(),
    isMainnet: isMainnet()
});

export default {
    SOLANA_NETWORK,
    getRPCEndpoint,
    createConnection,
    SUPPORTED_WALLETS,
    NETWORK_NAMES,
    getExplorerUrl,
    getAddressExplorerUrl,
    TX_CONFIRMATION_TIMEOUT,
    TX_CONFIRMATION_COMMITMENT,
    AIRDROP_AMOUNT,
    isDevnet,
    isMainnet,
    getSolanaConfig
};
