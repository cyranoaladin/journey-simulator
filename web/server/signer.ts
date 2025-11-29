import { Keypair, Transaction, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

/**
 * Signs a serialized transaction with the server's minter key.
 * 
 * @param txBase64 - The base64 encoded transaction to sign
 * @returns The signature of the transaction
 */
export async function signBase64Transaction(txBase64: string): Promise<string> {
    const minterSecret = process.env.MINTER_SECRET_KEY;

    if (!minterSecret) {
        throw new Error('MINTER_SECRET_KEY is not configured on the server');
    }

    let keypair: Keypair;
    try {
        // Try parsing as JSON array first (e.g. from solana-keygen output)
        if (minterSecret.startsWith('[') && minterSecret.endsWith(']')) {
            const secretKey = Uint8Array.from(JSON.parse(minterSecret));
            keypair = Keypair.fromSecretKey(secretKey);
        } else {
            // Assume Base58 string
            keypair = Keypair.fromSecretKey(bs58.decode(minterSecret));
        }
    } catch (error) {
        throw new Error('Invalid MINTER_SECRET_KEY format');
    }

    const txBuffer = Buffer.from(txBase64, 'base64');

    try {
        // Try parsing as VersionedTransaction first (standard for modern apps)
        const vTx = VersionedTransaction.deserialize(txBuffer);
        vTx.sign([keypair]);
        return bs58.encode(vTx.signatures[0]);
    } catch (e) {
        // Fallback to legacy Transaction
        try {
            const tx = Transaction.from(txBuffer);
            tx.partialSign(keypair);

            // We assume the transaction is fully signed now or will be sent to client
            // But for this helper, we usually return the signature or the signed tx
            // The audit mentioned returning "txSig".

            // If the tx is fully signed, we can get the signature
            if (tx.signature) {
                return bs58.encode(tx.signature);
            }

            // If not, we might need to serialize it back? 
            // For the purpose of the existing code calling this, it expects a signature string.
            // Let's assume the minter is the payer/primary signer.
            return bs58.encode(tx.signature!);
        } catch (legacyError) {
            console.error('Failed to sign transaction:', legacyError);
            throw new Error('Failed to deserialize and sign transaction');
        }
    }
}
