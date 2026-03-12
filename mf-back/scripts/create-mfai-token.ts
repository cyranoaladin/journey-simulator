#!/usr/bin/env ts-node
/**
 * @file create-mfai-token.ts
 * @description Script de création du token $MFAI (SPL Token-2022) sur devnet
 * 
 * USAGE :
 *   npx ts-node scripts/create-mfai-token.ts
 * 
 * PRÉREQUIS :
 *   - MINTER_SECRET_KEY configuré dans .env
 *   - Solde SOL suffisant sur le wallet minter (demande airdrop automatique)
 * 
 * SORTIE :
 *   - Adresse du mint (à sauvegarder dans MFAI_TOKEN_MINT)
 *   - Transaction de création
 *   - Supply initiale mintée (1,000,000 $MFAI)
 * 
 * ⚠️ À exécuter UNE SEULE FOIS par environnement (devnet/mainnet)
 * 
 * @author Kimi Code CLI — Phase 4 — 2026-03-12
 */

import * as dotenv from 'dotenv';
dotenv.config();

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  createMint,
  mintTo,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import bs58 from 'bs58';

// ─── Configuration ───────────────────────────────────────────────────────────

const RPC_URL = process.env.SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';
const CLUSTER = process.env.SOLANA_CLUSTER ?? 'devnet';

console.log('═══════════════════════════════════════════════════════════');
console.log('  CRÉATION TOKEN $MFAI — Money Factory AI');
console.log(`  Réseau: ${CLUSTER}`);
console.log('═══════════════════════════════════════════════════════════\n');

// ─── Validation ──────────────────────────────────────────────────────────────

const secretKey = process.env.MINTER_SECRET_KEY;
if (!secretKey) {
  console.error('❌ Erreur: MINTER_SECRET_KEY non configuré dans .env');
  process.exit(1);
}

if (CLUSTER === 'mainnet-beta') {
  console.error('⚠️  ATTENTION: Vous êtes sur mainnet!');
  console.error('   Ce script créera un token réel avec de la valeur.');
  console.error('   Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes...');
  // Sleep 5s
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000);
}

// ─── Initialisation ──────────────────────────────────────────────────────────

const connection = new Connection(RPC_URL, 'confirmed');

let minterKeypair: Keypair;
try {
  if (secretKey.startsWith('[')) {
    minterKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(secretKey)));
  } else {
    minterKeypair = Keypair.fromSecretKey(bs58.decode(secretKey));
  }
} catch (error) {
  console.error('❌ Erreur: MINTER_SECRET_KEY invalide');
  process.exit(1);
}

console.log('🔑 Wallet minter:', minterKeypair.publicKey.toBase58());

// ─── Airdrop devnet ──────────────────────────────────────────────────────────

async function ensureAirdrop() {
  if (CLUSTER !== 'devnet') return;
  
  const balance = await connection.getBalance(minterKeypair.publicKey);
  console.log(`💰 Solde actuel: ${balance / LAMPORTS_PER_SOL} SOL`);
  
  if (balance < 0.5 * LAMPORTS_PER_SOL) {
    console.log('🚰 Demande d\'airdrop devnet...');
    try {
      const sig = await connection.requestAirdrop(minterKeypair.publicKey, 2 * LAMPORTS_PER_SOL);
      await connection.confirmTransaction(sig, 'confirmed');
      console.log('✅ Airdrop 2 SOL reçu');
    } catch (error) {
      console.error('⚠️  Airdrop échoué:', error);
    }
  }
}

// ─── Création du token ───────────────────────────────────────────────────────

async function createToken() {
  await ensureAirdrop();
  
  console.log('\n🚀 Création du token $MFAI...\n');
  
  try {
    // 1. Créer le mint Token-2022
    console.log('1. Création du mint...');
    const mintKeypair = Keypair.generate();
    
    const mintPubkey = await createMint(
      connection,
      minterKeypair,       // Payer
      minterKeypair.publicKey,  // Mint authority
      minterKeypair.publicKey,  // Freeze authority
      6,                   // Decimals (6 comme USDC)
      mintKeypair,         // Mint keypair
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log('   ✅ Mint créé:', mintPubkey.toBase58());
    
    // 2. Créer le compte token associé du minter
    console.log('2. Création du compte token du minter...');
    const minterTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      minterKeypair,
      mintPubkey,
      minterKeypair.publicKey,
      false,
      'confirmed',
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log('   ✅ Compte:', minterTokenAccount.address.toBase58());
    
    // 3. Mint la supply initiale
    console.log('3. Mint de la supply initiale (1,000,000 $MFAI)...');
    const initialSupply = 1_000_000 * 10 ** 6; // 1M avec 6 décimales
    
    await mintTo(
      connection,
      minterKeypair,
      mintPubkey,
      minterTokenAccount.address,
      minterKeypair,
      initialSupply,
      [],
      { commitment: 'confirmed' },
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log('   ✅ Supply mintée:', initialSupply / 10 ** 6, '$MFAI');
    
    // ─── Résultat ────────────────────────────────────────────────────────────
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  ✅ TOKEN $MFAI CRÉÉ AVEC SUCCÈS');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    console.log('📋 INFORMATIONS:');
    console.log('   Mint Address:', mintPubkey.toBase58());
    console.log('   Decimals:', 6);
    console.log('   Supply initiale:', '1,000,000 $MFAI');
    console.log('   Authority:', minterKeypair.publicKey.toBase58());
    console.log('   Program:', 'Token-2022 (spl-token-2022)');
    
    console.log('\n⚙️  CONFIGURATION:');
    console.log('   Ajoutez cette ligne à votre fichier .env:');
    console.log(`   MFAI_TOKEN_MINT=${mintPubkey.toBase58()}`);
    
    console.log('\n🔍 EXPLORER:');
    console.log(`   https://explorer.solana.com/address/${mintPubkey.toBase58()}?cluster=${CLUSTER}`);
    
    console.log('\n💡 PROCHAINES ÉTAPES:');
    console.log('   1. Copiez MFAI_TOKEN_MINT dans votre .env');
    console.log('   2. Redémarrez le serveur mf-back');
    console.log('   3. Testez le endpoint POST /api/token/transfer');
    console.log('   4. Les Blinks pourront maintenant transférer des $MFAI réels');
    
  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error);
    process.exit(1);
  }
}

// ─── Exécution ───────────────────────────────────────────────────────────────

createToken().then(() => {
  console.log('\n✨ Terminé!');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Erreur fatale:', error);
  process.exit(1);
});
