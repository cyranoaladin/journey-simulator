// Minimal stubs for Solana wallet adapter (dev preview)
export const useWallet = () => ({
  connected: false,
  connecting: false,
  publicKey: null as any,
  wallet: null as any,
  connect: async () => {},
  disconnect: () => {},
  signTransaction: undefined as any,
});
export const useConnection = () => ({ connection: null as any });
export const ConnectionProvider: any = ({ children }: any) => {
  return children as any;
};
export const WalletProvider: any = ({ children }: any) => {
  return children as any;
};
