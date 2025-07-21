import express from 'express';
import { Connection, PublicKey, Keypair, Transaction } from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

const SOLANA_ENDPOINT = 'https://api.testnet.solana.com';
const TOKEN_MINT = new PublicKey(process.env.MFAI_MINT!);
const FAUCET_SECRET = JSON.parse(process.env.FAUCET_SECRET || '[]');
const FAUCET_AMOUNT = 10n * 10n ** 9n; // 10 MFAI with 9 decimals
const PORT = process.env.PORT || 3001;

const connection = new Connection(SOLANA_ENDPOINT);
const faucetKeypair = Keypair.fromSecretKey(new Uint8Array(FAUCET_SECRET));

const app = express();
app.use(express.json());

app.post('/request', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) {
      return res.status(400).json({ success: false, error: 'Missing address' });
    }

    const user = new PublicKey(address);
    const recipientAta = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      TOKEN_MINT,
      user
    );

    const faucetAta = await getOrCreateAssociatedTokenAccount(
      connection,
      faucetKeypair,
      TOKEN_MINT,
      faucetKeypair.publicKey
    );

    const ix = createTransferInstruction(
      faucetAta.address,
      recipientAta.address,
      faucetKeypair.publicKey,
      Number(FAUCET_AMOUNT),
      [],
      TOKEN_PROGRAM_ID
    );

    const tx = new Transaction().add(ix);
    const signature = await connection.sendTransaction(tx, [faucetKeypair]);
    await connection.confirmTransaction(signature);

    return res.json({ success: true, signature });
  } catch (error: any) {
    console.error('Faucet error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Faucet listening on port ${PORT}`);
});
