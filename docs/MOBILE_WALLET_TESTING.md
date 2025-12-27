# 📱 Mobile Wallet Testing Guide

## Overview

This guide outlines the steps to verify wallet connectivity and NFT minting on mobile devices, specifically for the "Investor Demo" flow.

## 🛠️ Prerequisites

1. **Mobile Device**: iOS or Android
2. **Wallet Apps**:
   - Phantom (Recommended)
   - Backpack
   - Solflare
3. **Network**: Ensure mobile device and dev server are on the same network (or use ngrok/localtunnel)

## 🧪 Test Cases

### 1. Deep Link Connection

**Objective**: Verify that clicking "Connect Wallet" on mobile opens the wallet app.

**Steps**:
1. Open `https://journey.mfai.app` (or local IP) in mobile browser (Safari/Chrome).
2. Tap "Connect Wallet".
3. Select "Phantom" (or "Detected Wallet").
4. **Expected**: Phantom app opens automatically.
5. **Expected**: Prompt to "Connect" appears in Phantom.
6. Approve connection.
7. **Expected**: Redirect back to browser, wallet shows as connected.

### 2. Transaction Signing (Minting)

**Objective**: Verify that minting an NFT triggers the wallet app for signing.

**Steps**:
1. Complete a journey phase to unlock minting.
2. Tap "Mint NFT".
3. **Expected**: Phantom app opens automatically.
4. **Expected**: Transaction approval screen appears.
5. Verify transaction details (Network: Devnet/Mainnet, Fee, etc.).
6. Tap "Approve".
7. **Expected**: Redirect back to browser.
8. **Expected**: Success message "NFT Minted Successfully".

### 3. Responsive UI Check

**Objective**: Ensure the wallet modal and minting UI are usable on small screens.

**Checklist**:
- [ ] Wallet modal fits on screen
- [ ] "Connect" buttons are easily tappable
- [ ] Transaction status toasts are visible
- [ ] No horizontal scrolling required for core actions

## 🐛 Troubleshooting

**Issue**: Wallet app doesn't open.
**Fix**: Ensure you are using the correct deep link format:
`https://phantom.app/ul/browse/https://journey.mfai.app?ref=https://journey.mfai.app`

**Issue**: "App not installed" error.
**Fix**: Verify the wallet app is installed and updated.

**Issue**: Connection fails after redirect.
**Fix**: Ensure the dApp uses standard `@solana/wallet-adapter` mobile logic.

## 📝 Notes for Developers

- Use `ngrok http 3000` to expose your local server for mobile testing.
- Check `console.log` via remote debugging (USB) if issues persist.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
