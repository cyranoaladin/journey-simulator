import { motion } from 'framer-motion';
import { FileText, Github, MessageCircle, Twitter, Users } from 'lucide-react';

const Footer = () => {
  const footerLinks = {
    journeys: [
      { label: 'Personas', href: '#personas' },
      { label: 'Activation Journey', href: '#journey' },
      { label: 'Skillchain Mining™', href: '#skillchain' },
    ],
    community: [
      { label: 'Discord', href: '#', icon: MessageCircle },
      { label: 'Twitter', href: '#', icon: Twitter },
      { label: 'GitHub', href: '#', icon: Github },
      { label: 'Forum', href: '#', icon: Users },
    ],
    resources: [
      { label: 'Whitepaper', href: '#', icon: FileText },
      { label: 'Litepaper', href: '#', icon: FileText },
      { label: 'Protocol Paper', href: '#', icon: FileText },
      { label: 'FAQ', href: '#', icon: FileText },
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
              Transform your skills into capital in the Proof Economy through the Cognitive Activation Protocol™
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
          <p>© 2024 Money Factory AI. All rights reserved.</p>
          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            {[Twitter, MessageCircle, Github].map((Icon, index) => (
              <motion.a
                key={Icon.displayName ?? index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
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
