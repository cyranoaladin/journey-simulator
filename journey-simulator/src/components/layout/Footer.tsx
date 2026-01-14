/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { motion } from 'framer-motion';
import { FileText, Github, Send, Twitter as XIcon, Users } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    journeys: [
      { label: 'Personas', href: '#personas' },
      { label: 'Activation Journey', href: '#journey' },
      { label: 'Skillchain Mining', href: '#skillchain' },
    ],
    community: [
      // Note: Discord URL is intentionally omitted here until a canonical invite is published.
      { label: 'X', href: 'https://x.com/Moneyfactoryai', icon: XIcon },
      { label: 'Telegram', href: 'https://t.me/MoneyFacoryAI_Portal', icon: Send },
      { label: 'GitHub', href: 'https://github.com/cyranoaladin/Money_Factory', icon: Github },
      { label: 'Support', href: '/support', icon: Users },
    ],
    resources: [
      { label: 'Platform Guide', href: '/guide', icon: FileText },
      { label: 'Resources', href: '/resources', icon: FileText },
      { label: 'Docs (mfai.app)', href: 'https://mfai.app/docs.html', icon: FileText },
      { label: 'Litepaper (mfai.app)', href: 'https://mfai.app/litepaper.html', icon: FileText },
    ],
  };

  return (
    <footer className="border-t border-white/10 py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <img src="/images/logo_mfai.png" alt="MFAI Logo" className="h-6 w-6" />
              </div>
              <span className="font-space text-xl font-bold gradient-text">Money Factory AI</span>
            </div>
            <p className="max-w-xs text-sm opacity-80">
              Transform your skills into capital in the Proof Economy through the Cognitive Activation Protocol
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
              <span>Powered by</span>
              <img src="/images/solana.svg" alt="Solana" className="h-5 w-5" />
              <span>Solana</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-4 font-space text-lg font-semibold">Journeys</h3>
            <ul className="space-y-2">
              {footerLinks.journeys.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm opacity-80 transition-colors hover:text-primary-400 hover:opacity-100"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="mb-4 font-space text-lg font-semibold">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                      className="flex items-center space-x-2 text-sm opacity-80 transition-colors hover:text-primary-400 hover:opacity-100"
                    >
                      <Icon size={16} />
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 text-sm opacity-60 md:flex-row"
        >
          <p> 2024 Money Factory AI. All rights reserved.</p>
          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            {[
              { Icon: XIcon, href: 'https://x.com/Moneyfactoryai' },
              { Icon: Send, href: 'https://t.me/MoneyFacoryAI_Portal' },
              { Icon: Github, href: 'https://github.com/cyranoaladin/Money_Factory' },
            ].map(({ Icon, href }, index) => (
              <motion.a
                key={Icon.displayName ?? index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
              >
                <Icon size={16} />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
