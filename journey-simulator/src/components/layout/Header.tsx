import MainNavigation from '../navigation/MainNavigation';

type HeaderProps = {
  enableWallet?: boolean;
};

const Header = ({ enableWallet = true }: HeaderProps) => {
  return <MainNavigation enableWallet={enableWallet} />;
};

export default Header;
