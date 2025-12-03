import { ReactNode, useMemo } from 'react';
import { useWorkspaceLayout } from '../../contexts/WorkspaceLayoutContext';

type MainProps = {
  children: ReactNode;
};

const Main = ({ children }: MainProps) => {
  const { focusMode, density } = useWorkspaceLayout();

  const spacingClass = useMemo(() => (density === 'compact' ? 'space-y-8' : 'space-y-12'), [density]);
  const paddingClass = focusMode ? 'px-4 sm:px-6 lg:px-8' : 'px-4 sm:px-6 lg:px-10 xl:px-12';
  const maxWidthClass = focusMode ? 'mx-auto w-full max-w-4xl' : 'mx-auto w-full max-w-6xl xl:max-w-7xl';

  return (
    <main className="relative flex-1">
      <div className={`${maxWidthClass} ${spacingClass} ${paddingClass} py-10 transition-[max-width] duration-300`}>{children}</div>
    </main>
  );
};

export default Main;
