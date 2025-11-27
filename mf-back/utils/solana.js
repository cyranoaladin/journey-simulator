const { Connection, PublicKey } = require("@solana/web3.js");

// Default to Devnet for this project
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const connection = new Connection(SOLANA_RPC_URL, "confirmed");

/**
 * Verifies a Solana transaction for NFT minting.
 * @param {string} signature - The transaction signature to verify.
 * @param {string} userWallet - The expected signer's wallet address.
 * @returns {Promise<boolean>} - True if valid, throws error otherwise.
 */
async function verifyTransaction(signature, userWallet) {
    if (!signature || !userWallet) {
        throw new Error("Missing signature or user wallet");
    }

    try {
        console.log(`[Solana] Verifying tx: ${signature} for wallet: ${userWallet}`);

        // 1. Fetch transaction
        const tx = await connection.getTransaction(signature, {
            maxSupportedTransactionVersion: 0,
        });

        if (!tx) {
            throw new Error("Transaction not found on Solana Devnet");
        }

        if (tx.meta && tx.meta.err) {
            throw new Error(`Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}`);
        }

        // 2. Verify Signer
        // The first account in accountKeys is usually the fee payer/signer
        // In newer versions, accountKeys is a MessageAccountKeys object, need to handle carefully
        const accountKeys = tx.transaction.message.getAccountKeys
            ? tx.transaction.message.getAccountKeys().staticAccountKeys
            : tx.transaction.message.accountKeys;

        const signer = accountKeys[0].toString();

        if (signer !== userWallet) {
            throw new Error(`Transaction signer (${signer}) does not match user wallet (${userWallet})`);
        }

        // 3. (Optional) Verify Recency
        // We could check blockTime to ensure it's not an old reused transaction
        const now = Math.floor(Date.now() / 1000);
        if (tx.blockTime && (now - tx.blockTime > 3600)) { // 1 hour expiration
            throw new Error("Transaction is too old (> 1 hour)");
        }

        console.log("[Solana] Transaction verified successfully.");
        return true;

    } catch (error) {
        console.error("[Solana] Verification failed:", error.message);
        throw error;
    }
}

module.exports = {
    verifyTransaction,
    connection // Exported for mocking
};
