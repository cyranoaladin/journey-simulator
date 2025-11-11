// Minimal stubs for Solana wallet adapter UI (dev preview)
export const useWalletModal = () => ({
  visible: false,
  setVisible: (_: boolean) => {},
});
export const WalletMultiButton: any = (props: any) => {
  return (globalThis as any).React
    ? (globalThis as any).React.createElement("button", props, "Connect Wallet")
    : "Connect Wallet";
};
