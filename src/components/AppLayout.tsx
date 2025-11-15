import { ReactNode } from 'react'
import Header from './Header'

interface AppLayoutProps {
  children: ReactNode
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <>
      <Header />
      <div className="pt-header flex flex-col gap-0">
        {children}
      </div>
    </>
  )
}

export default AppLayout
