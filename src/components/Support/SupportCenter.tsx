import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Bot,
  Headphones,
  LifeBuoy,
  Mail,
  MessageSquare,
  ListChecks,
  ShieldAlert,
  Sparkles,
  UserCheck
} from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
  category: 'DAO' | 'Resources' | 'Support'
}

const faqs: FaqItem[] = [
  {
    id: 'dao-quorum',
    question: 'Comment atteindre rapidement le quorum DAO ?',
    answer: 'Active ton staking MFAI, attribue du voting power aux comptes opérationnels clés et programme un rappel Zyno pour relancer les votants qui n\'ont pas signé. Utilise la console DAO pour suivre le pourcentage d\'atteinte en direct.',
    category: 'DAO'
  },
  {
    id: 'resources-sync',
    question: 'Où trouver les templates AEPO / AECO ?',
    answer: 'Rends-toi dans la section Resources et filtre par tag "Analytics". Télécharge le playbook Mission Feedback Loops puis connecte-le au module d\'ingestion RAG pour propulser les agents.',
    category: 'Resources'
  },
  {
    id: 'support-wallet',
    question: 'Je n\'arrive pas à connecter mon wallet.',
    answer: 'Vérifie les autorisations Phantom/Torus dans ton navigateur, puis réinitialise la session via Wallet Connection Banner. Si le problème persiste, ouvre un ticket support avec la console Zyno (type "wallet" + capture).',
    category: 'Support'
  },
  {
    id: 'mission-reset',
    question: 'Puis-je relancer un parcours depuis zéro ?',
    answer: 'Oui, utilise le bouton Reset dans Journeys pour effacer ta progression locale, puis demande à Zyno un nouveau script de missions en sélectionnant la persona souhaitée. Les XP et NFTs resteront archivés dans ton profil.',
    category: 'Support'
  }
]

const SupportCenter = () => {
  const [activeCategory, setActiveCategory] = useState<FaqItem['category'] | 'All'>('All')
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  const displayedFaqs = faqs.filter((item) => activeCategory === 'All' || item.category === activeCategory)

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-accent-neon/20 via-primary-500/10 to-surface-900 p-8 text-white shadow-glass"
      >
        <div className="absolute -bottom-12 right-12 h-48 w-48 rounded-full bg-accent-neon/20 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <LifeBuoy size={14} />
              Support & QA Hub
            </span>
            <h1 className="text-3xl font-semibold lg:text-4xl">
              Obtiens de l\'aide en temps réel et partage tes feedbacks avec Zyno
            </h1>
            <p className="text-sm text-white/75 lg:text-base">
              Les builders ne devraient jamais être bloqués. Déploie la knowledge base, contacte un agent humain ou
              lance un diagnostic automatique sur ton parcours.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-effect flex max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-6"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
              <span>Modes d\'assistance</span>
              <Sparkles size={16} className="text-accent-neon" />
            </div>
            <div className="space-y-3 text-sm text-white/75">
              <div className="flex items-center gap-3">
                <Bot size={18} />
                <span>Requêtes guidées via Zyno</span>
              </div>
              <div className="flex items-center gap-3">
                <Headphones size={18} />
                <span>Escalade vers l'équipe MFAI (24h)</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} />
                <span>Alertes incidents critiques</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-effect flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <MessageSquare size={18} />
            Chat Zyno
          </div>
          <p className="text-sm text-white/70">
            Laisse Zyno contextualiser ton blocage et obtenir des recommandations étape par étape. Utilise la commande « aide moi » dans la console.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
          >
            Ouvrir la console
            <ArrowRight size={14} />
          </button>
        </article>

        <article className="glass-effect flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <Mail size={18} />
            Email mission control
          </div>
          <p className="text-sm text-white/70">
            Décris ton problème avec captures, wallet et mission. Nous répondons sous 24h UTC avec un plan d\'action.
          </p>
          <a
            href="mailto:support@moneyfactory.ai"
            className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
          >
            Envoyer un email
            <ArrowRight size={14} />
          </a>
        </article>

        <article className="glass-effect flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <ListChecks size={18} />
            QA Checklist
          </div>
          <p className="text-sm text-white/70">
            Passe en revue l\'audit responsive, connectivité wallet et synchronisation backend avant chaque démo.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
          >
            Télécharger la checklist
            <ArrowRight size={14} />
          </button>
        </article>
      </section>

      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <h2 className="text-xl font-semibold">FAQ pilotée</h2>
            <p className="text-sm text-white/60">
              Filtre par thématique et ouvre un ticket si une réponse manque.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <UserCheck size={14} />
            {displayedFaqs.length} résultats
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          {(['All', 'DAO', 'Resources', 'Support'] as const).map((category) => {
            const isActive = activeCategory === category
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? 'bg-gradient-accent text-white shadow-glow'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            )
          })}
        </div>

        <div className="space-y-3">
          {displayedFaqs.map((faq) => {
            const isOpen = openFaq === faq.id
            return (
              <motion.article
                key={faq.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.3 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq((prev) => (prev === faq.id ? null : faq.id))}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="text-sm font-semibold">{faq.question}</span>
                  <motion.span animate={{ rotate: isOpen ? 90 : 0 }}>
                    <ArrowRight size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.p
                      key="faq-answer"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="mt-3 text-sm text-white/70"
                    >
                      {faq.answer}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.article>
            )
          })}
        </div>
      </section>
    </section>
  )
}

export default SupportCenter
