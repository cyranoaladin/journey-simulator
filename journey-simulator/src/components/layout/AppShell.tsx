import { ReactNode, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Route, 
  Bot, 
  Users, 
  X,
  Menu,
  MessageCircle
} from 'lucide-react';
import { SidebarNew as Sidebar } from './SidebarNew';
import { TopBar } from './TopBar';
import { ZynoPanel } from './ZynoPanel';
import { useZynoStream } from '../../hooks/useZynoStream';
import { clsx } from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

interface AppShellProps {
  children: ReactNode;
}

// Navigation items pour la bottom bar mobile
const MOBILE_NAV_ITEMS = [
  { id: 'dashboard', label: 'Accueil', icon: Home, path: '/dashboard' },
  { id: 'journey', label: 'Parcours', icon: Route, path: '/journey' },
  { id: 'agents', label: 'Agents', icon: Bot, path: '/agents' },
  { id: 'dao', label: 'DAO', icon: Users, path: '/dao' },
];

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [zynoOpen, setZynoOpen] = useState(false);
  const [zynoInput, setZynoInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const { messages, isTyping, sendMessage } = useZynoStream();
  
  const location = useLocation();
  const navigate = useNavigate();

  // Détection mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Sur desktop, on ouvre la sidebar par défaut
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSend = () => {
    if (zynoInput.trim()) {
      sendMessage(zynoInput.trim());
      setZynoInput('');
    }
  };

  const activeRoute = MOBILE_NAV_ITEMS.find(item => 
    location.pathname.startsWith(item.path)
  )?.id || 'dashboard';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-void bg-noise">
      {/* Sidebar - Desktop: always visible, Mobile: drawer overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Overlay sombre sur mobile */}
            {isMobile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-void/80 backdrop-blur-sm z-40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <motion.aside
              initial={isMobile ? { x: '-100%' } : { x: 0 }}
              animate={{ x: 0 }}
              exit={isMobile ? { x: '-100%' } : undefined}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={clsx(
                'z-50 h-full',
                isMobile ? 'fixed left-0 top-0 w-[280px]' : 'relative w-[260px]'
              )}
            >
              <Sidebar 
                open={true} 
                onToggle={() => setSidebarOpen(false)} 
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* TopBar - caché sur mobile (on utilise la bottom nav) */}
        <div className="hidden md:block">
          <TopBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/5 bg-void/50 backdrop-blur-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/5 text-ink-300"
          >
            <Menu size={24} />
          </button>
          <h1 className="font-display font-bold text-ink-50">MFAI</h1>
          <button
            onClick={() => setZynoOpen(!zynoOpen)}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              zynoOpen ? 'bg-gold-400/20 text-gold-300' : 'text-ink-300 hover:bg-white/5'
            )}
          >
            <MessageCircle size={24} />
          </button>
        </div>
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0">
          <motion.div
            key="main-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Zyno Panel - Desktop: floating panel, Mobile: bottom sheet */}
      <AnimatePresence>
        {zynoOpen && (
          <>
            {/* Desktop: floating panel */}
            <div className="hidden md:block">
              <ZynoPanel
                messages={messages}
                input={zynoInput}
                onInput={setZynoInput}
                onSend={handleSend}
                onToggle={() => setZynoOpen(!zynoOpen)}
                minimized={false}
                isTyping={isTyping}
              />
            </div>

            {/* Mobile: Bottom sheet */}
            <div className="md:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-void/60 backdrop-blur-sm z-40"
                onClick={() => setZynoOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed bottom-0 left-0 right-0 z-50 h-[70vh]"
              >
                <div className="h-full rounded-t-3xl border-t border-gold-400/20 bg-slate-50 shadow-2xl overflow-hidden flex flex-col">
                  {/* Handle bar */}
                  <div className="flex items-center justify-center py-3 border-b border-white/5">
                    <div className="w-12 h-1 rounded-full bg-white/20" />
                  </div>
                  
                  {/* ZynoPanel contenu adapté */}
                  <div className="flex-1 overflow-hidden">
                    <ZynoPanelMobile
                      messages={messages}
                      input={zynoInput}
                      onInput={setZynoInput}
                      onSend={handleSend}
                      onToggle={() => setZynoOpen(false)}
                      isTyping={isTyping}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop: Zyno minimized button */}
      {!zynoOpen && !isMobile && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-100 border border-gold-400/30 shadow-gold-glow hover:shadow-gold-glow-lg transition-all"
          onClick={() => setZynoOpen(true)}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400/20 to-cyan-300/20 flex items-center justify-center text-lg">
            ⚡
          </div>
          <span className="text-sm font-medium text-ink-100">Ask Zyno</span>
        </motion.button>
      )}

      {/* Mobile: Bottom Navigation Bar */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-void/90 backdrop-blur-lg border-t border-white/5">
          <div className="flex items-center justify-around px-2 py-2">
            {MOBILE_NAV_ITEMS.map((item) => {
              const isActive = activeRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all',
                    isActive 
                      ? 'text-gold-300' 
                      : 'text-ink-400 hover:text-ink-200'
                  )}
                >
                  <item.icon 
                    size={20} 
                    className={clsx(
                      'transition-transform',
                      isActive && 'scale-110'
                    )} 
                  />
                  <span className="text-2xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-gold-400"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {/* Safe area pour iOS */}
          <div className="h-safe-area-inset-bottom" />
        </nav>
      )}
    </div>
  );
}

// Version simplifiée de ZynoPanel pour mobile (bottom sheet)
interface ZynoPanelMobileProps {
  messages: any[];
  input: string;
  onInput: (v: string) => void;
  onSend: () => void;
  onToggle: () => void;
  isTyping: boolean;
}

function ZynoPanelMobile({ messages, input, onInput, onSend, onToggle, isTyping }: ZynoPanelMobileProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400/20 to-cyan-300/20 flex items-center justify-center text-xl">
            ⚡
          </div>
          <div>
            <h3 className="font-semibold text-ink-100">Zyno AI</h3>
            <p className="text-2xs text-ink-400">
              {isTyping ? 'Thinking...' : 'Online'}
            </p>
          </div>
        </div>
        <button 
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-white/5 text-ink-400"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-void flex items-center justify-center text-4xl mb-4">
              ⚡
            </div>
            <h4 className="text-lg font-display font-semibold text-ink-100">
              Welcome to Money Factory
            </h4>
            <p className="text-sm text-ink-400 mt-2">
              Your AI companion for DeFi automation
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={clsx(
                'flex gap-3',
                msg.role === 'user' && 'flex-row-reverse'
              )}
            >
              {msg.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400/20 to-cyan-300/20 flex items-center justify-center text-sm flex-shrink-0">
                  ⚡
                </div>
              )}
              <div className={clsx(
                'max-w-[80%] px-4 py-3 rounded-2xl text-sm',
                msg.role === 'user' 
                  ? 'bg-gold-400 text-void font-medium'
                  : 'bg-slate-100/80 text-ink-100'
              )}>
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => onInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Ask Zyno anything..."
            disabled={isTyping}
            className={clsx(
              'w-full pl-4 pr-12 py-3 rounded-xl text-sm',
              'bg-void border border-white/10 text-ink-100 placeholder:text-ink-500',
              'focus:outline-none focus:border-gold-400/50',
              'transition-all duration-200',
              isTyping && 'opacity-60'
            )}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isTyping}
            className={clsx(
              'absolute right-2 top-1/2 -translate-y-1/2',
              'p-2 rounded-lg transition-all duration-200',
              input.trim() && !isTyping
                ? 'bg-gold-400 text-void'
                : 'bg-white/5 text-ink-500'
            )}
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
