/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import MainNavigation from '../navigation/MainNavigation';

type HeaderProps = {
  enableWallet?: boolean;
};

const Header = ({ enableWallet = true }: HeaderProps) => {
  return <MainNavigation enableWallet={enableWallet} />;
};

export default Header;
