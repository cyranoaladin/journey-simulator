import { ReactNode } from 'react';

type MainProps = {
  children: ReactNode;
};

const Main = ({ children }: MainProps) => {
  return (
    <main className="relative flex-1">
      <div className="w-full space-y-12 px-2 py-10 sm:px-3 lg:px-4">
        {children}
      </div>
    </main>
  );
};

export default Main;
