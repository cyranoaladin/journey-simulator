import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Main from './Main';
import Footer from './Footer';
import ZynoChatSidebar from '../Zyno/ZynoChatSidebar';
import JourneyModal from '../shared/JourneyModal';
import ZynoAssistant from '../shared/ZynoAssistant';
import BackToTopButton from '../shared/BackToTopButton';

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#09081a] via-[#0D0B1F] to-[#0D0B1F] text-slate-100">
      <Header />
      <div className="flex w-full gap-6 px-2 pb-16 pt-[calc(var(--header-height,4rem)+var(--skillchain-banner-offset,0px)+var(--wallet-banner-offset,0px)+1.5rem)] sm:px-3 lg:px-4">
        <Sidebar />
        <Main>{children}</Main>
        <ZynoChatSidebar />
      </div>
      <Footer />
      <JourneyModal />
      <ZynoAssistant />
      <BackToTopButton />
    </div>
  );
};

export default Layout;
