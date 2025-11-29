/**
 * Shared Solana Configuration Module
 * 
 * Centralizes wallet configuration, RPC endpoints, and network settings
 * Used by both journey-simulator (frontend) and web (Next.js portal)
 */

import { clusterApiUrl, Connection } from '@solana/web3.js';
import type { Cluster } from '@solana/web3.js';

// Network configuration
export const SOLANA_NETWORK: Cluster = (process.env.VITE_SOLANA_NETWORK as Cluster) || 'devnet';

// RPC Endpoints
export const getRPCEndpoint = (): string => {
    // Priority: custom RPC > environment variable > default cluster URL
    if (process.env.VITE_SOLANA_RPC_URL) {
        return process.env.VITE_SOLANA_RPC_URL;
    }

    if (process.env.NEXT_PUBLIC_SOLANA_RPC_URL) {
        return process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    }

    return clusterApiUrl(SOLANA_NETWORK);
};

// Create connection instance
export const createConnection = (): Connection => {
    const endpoint = getRPCEndpoint();
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
