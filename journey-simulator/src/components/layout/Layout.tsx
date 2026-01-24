/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { ReactNode } from 'react';
import Header from './Header';
import DemoModeBanner from '../shared/DemoModeBanner';
import Sidebar from './Sidebar';
import Main from './Main';
import Footer from './Footer';
import ZynoChatSidebar from '../Zyno/ZynoChatSidebar';
import JourneyModal from '../shared/JourneyModal';
import ZynoAssistant from '../shared/ZynoAssistant';
import BackToTopButton from '../shared/BackToTopButton';
import { WorkspaceLayoutProvider, useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';
import { logger } from '../../utils/logger';

type LayoutProps = {
  children: ReactNode;
  enableWallet?: boolean;
};

const LayoutShell = ({ children, enableWallet = true }: LayoutProps) => {
  const {
    focusMode,
    leftPanelOpen,
    rightPanelOpen,
    setLeftPanelOpen,
    setRightPanelOpen,
  } = useWorkspaceLayout();

  logger.debug('LayoutShell: render', { focusMode, leftPanelOpen, rightPanelOpen });

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#09081a] via-[#0D0B1F] to-[#0D0B1F] text-slate-100" data-focus-mode={focusMode} data-testid="trinity-layout">
      <Header enableWallet={enableWallet} />
      <DemoModeBanner />
      <div className="relative flex w-full justify-center">
        <div className="relative flex w-full flex-col pt-[calc(var(--header-height,4rem)+var(--skillchain-banner-offset,0px)+var(--wallet-banner-offset,0px)+1.5rem)]">
          <div className={`relative mx-auto flex w-full max-w-[1600px] gap-6 px-3 pb-16 transition-[padding] duration-300 sm:px-4 lg:px-6 ${focusMode ? 'justify-center gap-0 px-4 sm:px-6 lg:px-8' : ''}`}>
            {!focusMode && leftPanelOpen && (
              <>
                <div className="hidden xl:flex">
                  <Sidebar variant="docked" />
                </div>
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity xl:hidden" aria-hidden="true" onClick={() => setLeftPanelOpen(false)} />
                <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm px-4 py-6 xl:hidden">
                  <Sidebar variant="overlay" onClose={() => setLeftPanelOpen(false)} />
                </div>
              </>
            )}

            <Main>{children}</Main>

            {!focusMode && rightPanelOpen && (
              <>
                <div className="hidden 2xl:flex">
                  <ZynoChatSidebar variant="docked" />
                </div>
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity 2xl:hidden" aria-hidden="true" onClick={() => setRightPanelOpen(false)} />
                <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md px-4 py-6 2xl:hidden">
                  <ZynoChatSidebar variant="overlay" onClose={() => setRightPanelOpen(false)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {!focusMode && <Footer />}
      <JourneyModal />
      <ZynoAssistant />
      <BackToTopButton />
    </div>
  );
};

const Layout = ({ children, enableWallet = true }: LayoutProps) => {
  logger.debug('Layout: render');
  return (
    <WorkspaceLayoutProvider>
      <LayoutShell enableWallet={enableWallet}>{children}</LayoutShell>
    </WorkspaceLayoutProvider>
  );
};

export default Layout;
