import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Bell, 
  Network, 
  LogOut, 
  AlertTriangle,
  ChevronRight,
  Moon,
  Sun,
  Globe
} from 'lucide-react';
import { Card, Button, Badge, ZynoAvatar } from '../components/ui';
import { useJourneyStore } from '../store/journeyStore';
import { useToast } from '../contexts/ToastContext';
import { clsx } from 'clsx';

interface SettingSectionProps {
  title: string;
  description?: string;
  icon: any;
  children: React.ReactNode;
}

function SettingSection({ title, description, icon: Icon, children }: SettingSectionProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <Icon size={20} className="text-ink-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-bold text-ink-50">{title}</h3>
          {description && (
            <p className="text-sm text-ink-400 mt-1">{description}</p>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </Card>
  );
}

function Toggle({ 
  checked, 
  onChange, 
  label 
}: { 
  checked: boolean; 
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
        checked ? 'bg-gold-400' : 'bg-white/10'
      )}
    >
      <span
        className={clsx(
          'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1'
        )}
      />
      {label && <span className="ml-3 text-sm text-ink-300">{label}</span>}
    </button>
  );
}

export default function SettingsView() {
  const [activeNetwork, setActiveNetwork] = useState<'devnet' | 'mainnet'>('devnet');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    aepoUpdates: true,
    agentAlerts: true,
  });
  const [theme, setTheme] = useState<'dark' | 'light' | 'auto'>('dark');
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  
  const userProgress = useJourneyStore(state => state.userProgress);
  const updateWalletConnection = useJourneyStore(state => state.updateWalletConnection);
  const { addToast } = useToast();

  const handleDisconnect = () => {
    updateWalletConnection(false);
    addToast({
      type: 'info',
      title: 'Disconnected',
      message: 'Your wallet has been disconnected',
    });
    setShowDisconnectConfirm(false);
  };

  const handleSaveNotifications = () => {
    addToast({
      type: 'success',
      title: 'Preferences saved',
      message: 'Your notification preferences have been updated',
    });
  };

  const walletAddress = userProgress?.walletAddress;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1000px] mx-auto px-6 py-6"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-50">Settings</h1>
          <p className="text-ink-400 mt-1">
            Manage your account, notifications and preferences
          </p>
        </div>

        {/* Section Compte */}
        <SettingSection
          title="Account"
          description="Your personal information and connected wallet"
          icon={User}
        >
          <div className="space-y-4">
            {/* Avatar et nom */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              <ZynoAvatar state="idle" size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-ink-100">MFAI User</p>
                <p className="text-sm text-ink-400">
                  {walletAddress ? (
                    <span className="font-mono">
                      {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </span>
                  ) : (
                    'Wallet not connected'
                  )}
                </p>
              </div>
              <Badge variant={walletAddress ? 'success' : 'default'}>
                {walletAddress ? 'Connected' : 'Déconnecté'}
              </Badge>
            </div>

            {/* PassLevel */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
              <div>
                <p className="text-sm text-ink-400">Current Level</p>
                <p className="font-semibold text-ink-100 mt-1">INTERMEDIATE</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-ink-400">AEPO Score</p>
                <p className="font-mono font-bold text-gold-300 text-xl">74</p>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Section Notifications */}
        <SettingSection
          title="Notifications"
          description="Choose when and how to be notified"
          icon={Bell}
        >
          <div className="space-y-3">
            {[
              { key: 'email', label: 'Email notifications', desc: 'Receive important updates' },
              { key: 'push', label: 'Push notifications', desc: 'Real-time browser alerts' },
              { key: 'aepoUpdates', label: 'AEPO updates', desc: 'When your score evolves' },
              { key: 'agentAlerts', label: 'Agent alerts', desc: 'Notifications from your AI agents' },
              { key: 'marketing', label: 'Marketing communications', desc: 'News and special offers' },
            ].map((item) => (
              <div 
                key={item.key}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-ink-200">{item.label}</p>
                  <p className="text-xs text-ink-500">{item.desc}</p>
                </div>
                <Toggle
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={(v) => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="gold" size="sm" onClick={handleSaveNotifications}>
              Save
            </Button>
          </div>
        </SettingSection>

        {/* Section Réseau */}
        <SettingSection
          title="Network"
          description="Blockchain configuration and environment"
          icon={Network}
        >
          <div className="space-y-4">
            {/* Network Switch */}
            <div className="p-4 rounded-xl bg-white/5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-ink-100">Solana Network</p>
                  <p className="text-sm text-ink-400">
                    {activeNetwork === 'devnet' ? 'Devnet - Test' : 'Mainnet - Production'}
                  </p>
                </div>
                <div className={clsx(
                  'px-3 py-1 rounded-full text-xs font-bold uppercase',
                  activeNetwork === 'devnet' 
                    ? 'bg-amber-400/10 text-amber-400' 
                    : 'bg-emerald-400/10 text-emerald-400'
                )}>
                  {activeNetwork}
                </div>
              </div>

              {/* KILL SWITCH visuel */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveNetwork('devnet')}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    activeNetwork === 'devnet'
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-white/10 hover:border-white/20'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={clsx(
                      'w-3 h-3 rounded-full',
                      activeNetwork === 'devnet' ? 'bg-amber-400' : 'bg-white/20'
                    )} />
                    <span className="font-semibold text-ink-100">Devnet</span>
                  </div>
                  <p className="text-xs text-ink-400">
                    Test environment with free SOL
                  </p>
                </button>

                <button
                  onClick={() => {
                    addToast({
                      type: 'warning',
                      title: 'Mainnet coming soon',
                      message: 'Mainnet migration is scheduled for Phase 5',
                    });
                  }}
                  className={clsx(
                    'p-4 rounded-xl border-2 text-left transition-all opacity-50 cursor-not-allowed',
                    activeNetwork === 'mainnet'
                      ? 'border-emerald-400 bg-emerald-400/10'
                      : 'border-white/10'
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                    <span className="font-semibold text-ink-100">Mainnet</span>
                    <Badge variant="amber" className="text-2xs">Soon</Badge>
                  </div>
                  <p className="text-xs text-ink-400">
                    Production environment (real SOL)
                  </p>
                </button>
              </div>
            </div>

            {/* Theme and Language */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm font-medium text-ink-200 mb-3">Theme</p>
                <div className="flex gap-2">
                  {(['dark', 'light', 'auto'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={clsx(
                        'flex-1 p-2 rounded-lg text-xs font-medium capitalize transition-colors',
                        theme === t
                          ? 'bg-gold-400/20 text-gold-300'
                          : 'bg-white/5 text-ink-400 hover:bg-white/10'
                      )}
                    >
                      {t === 'dark' && <Moon size={14} className="inline mr-1" />}
                      {t === 'light' && <Sun size={14} className="inline mr-1" />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5">
                <p className="text-sm font-medium text-ink-200 mb-3">Language</p>
                <div className="flex gap-2">
                  {([
                    { code: 'fr', label: 'FR' },
                    { code: 'en', label: 'EN' },
                  ] as const).map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={clsx(
                        'flex-1 p-2 rounded-lg text-xs font-medium transition-colors',
                        language === l.code
                          ? 'bg-gold-400/20 text-gold-300'
                          : 'bg-white/5 text-ink-400 hover:bg-white/10'
                      )}
                    >
                      <Globe size={14} className="inline mr-1" />
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SettingSection>

        {/* Section Danger */}
        <SettingSection
          title="Danger Zone"
          description="Irreversible actions for your account"
          icon={AlertTriangle}
        >
          <div className="space-y-3">
            {!showDisconnectConfirm ? (
              <button
                onClick={() => setShowDisconnectConfirm(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-coral-400/5 border border-coral-400/20 hover:bg-coral-400/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={20} className="text-coral-400" />
                  <div className="text-left">
                    <p className="font-semibold text-coral-300">Disconnect wallet</p>
                    <p className="text-xs text-coral-400/70">
                      You will need to reconnect your wallet to use MFAI
                    </p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-coral-400" />
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-coral-400/10 border border-coral-400/30"
              >
                <p className="text-sm text-coral-200 mb-4">
                  Are you sure you want to disconnect your wallet?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDisconnectConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    Confirm disconnect
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </SettingSection>
      </div>
    </motion.div>
  );
}
