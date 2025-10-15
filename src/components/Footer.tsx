import React from "react";
import { motion } from "framer-motion";
import { Github, Twitter, MessageCircle, FileText, Users } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    journeys: [
      { label: "Personas", href: "#personas" },
      { label: "Activation Journey", href: "#journey" },
      { label: "Skillchain Mining™", href: "#skillchain" },
    ],
    community: [
      { label: "Discord", href: "#", icon: MessageCircle },
      { label: "Twitter", href: "#", icon: Twitter },
      { label: "GitHub", href: "#", icon: Github },
      { label: "Forum", href: "#", icon: Users },
    ],
    resources: [
      { label: "Whitepaper", href: "#", icon: FileText },
      { label: "Litepaper", href: "#", icon: FileText },
      { label: "Protocol Paper", href: "#", icon: FileText },
      { label: "FAQ", href: "#", icon: FileText },
    ],
  };

  return (
    <footer className="py-20 border-t border-white/10">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <img
                  src="/images/logo_mfai.png"
                  alt="MFAI Logo"
                  className="w-6 h-6"
                />
              </div>
              <span className="font-space font-bold text-xl gradient-text">
                Money Factory AI
              </span>
            </div>
            <p className="text-sm opacity-80 max-w-xs">
              Transform your skills into capital in the Proof Economy through
              the Cognitive Activation Protocol™
            </p>
          </motion.div>

          {/* Journeys */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="font-space font-semibold text-lg mb-4">Journeys</h3>
            <ul className="space-y-2">
              {footerLinks.journeys.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm opacity-80 hover:opacity-100 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Community */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 className="font-space font-semibold text-lg mb-4">Community</h3>
            <ul className="space-y-2">
              {footerLinks.community.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="flex items-center space-x-2 text-sm opacity-80 hover:opacity-100 hover:text-primary-400 transition-colors"
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

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm opacity-60">
            © 2024 Money Factory AI. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            {[Twitter, MessageCircle, Github].map((Icon, index) => (
              <motion.a
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                href="#"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
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
