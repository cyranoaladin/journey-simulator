/**
 * Layout Component - Legacy compatibility wrapper
 * Re-exports AppShell for backward compatibility
 */

import { ReactNode } from 'react';
import { AppShell } from './AppShell';

type LayoutProps = {
  children: ReactNode;
  enableWallet?: boolean;
};

export function Layout({ children }: LayoutProps) {
  return <AppShell>{children}</AppShell>;
}

export default Layout;
