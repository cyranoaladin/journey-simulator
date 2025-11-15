import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Moon, Sun, Menu, X, LogOut } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useAuth } from '../contexts/AuthContext'
import WalletButton from './WalletButton'

const Header = () => {
  const { isDark, toggleTheme } = useThemeStore()
  const { logout, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const navigate = useNavigate()
  const headerRef = useRef<HTMLElement | null>(null)

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Journeys', href: '/journeys' },
    { label: 'Zyno Console', href: '/zyno' },
    { label: 'Playground', href: '/playground' }
  ]

  const updateHeaderHeight = useCallback(() => {
    if (!headerRef.current) return
    const { height } = headerRef.current.getBoundingClientRect()
    document.documentElement.style.setProperty('--header-height', `${Math.ceil(height)}px`)
  }, [])

  // Handle scroll events to adjust header height
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useLayoutEffect(() => {
    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight)
    return () => window.removeEventListener('resize', updateHeaderHeight)
  }, [updateHeaderHeight])

  useLayoutEffect(() => {
    updateHeaderHeight()
  }, [updateHeaderHeight, isScrolled, isMobileMenuOpen])

  const handleNavigation = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 glass-effect transition-all duration-300 ${
        isScrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <img src="/images/logo_mfai.png" alt="MFAI Logo" className="w-6 h-6" />
            </div>
            <span className="font-space font-bold text-xl gradient-text">
              Money Factory AI
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleNavigation(item.href)}
                className="text-base font-medium transition-colors hover:text-primary-500"
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Wallet Button */}
            <WalletButton />

            {/* User Info and Logout */}
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-300">{user.email}</span>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={logout}
                  className="p-2 rounded-lg glass-effect text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut size={20} />
                </motion.button>
              </div>
            )}

            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2 rounded-lg glass-effect"
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg glass-effect"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 p-4 glass-effect rounded-lg"
          >
            {navItems.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleNavigation(item.href)}
                className="block w-full text-left py-2 text-base font-medium transition-colors hover:text-primary-500"
              >
                {item.label}
              </motion.button>
            ))}
            
            {/* Mobile Logout */}
            {user && (
              <div className="border-t border-gray-600/30 mt-4 pt-4">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-300">{user.email}</span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </div>
            )}
          </motion.nav>
        )}
      </div>
    </motion.header>
  )
}

export default Header