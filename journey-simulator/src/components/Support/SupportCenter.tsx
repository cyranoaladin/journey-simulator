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
    question: 'How to quickly reach DAO quorum?',
    answer: 'Activate your MFAI staking, assign voting power to key operational accounts, and schedule a Zyno reminder to nudge voters who haven\'t signed. Use the DAO console to track achievement percentage live.',
    category: 'DAO'
  },
  {
    id: 'resources-sync',
    question: 'Where to find AEPO / AECO templates?',
    answer: 'Go to the Resources section and filter by "Analytics" tag. Download the Mission Feedback Loops playbook then connect it to the RAG ingestion module to power the agents.',
    category: 'Resources'
  },
  {
    id: 'support-wallet',
    question: 'I cannot connect my wallet.',
    answer: 'Check Phantom/Torus permissions in your browser, then reset the session via Wallet Connection Banner. If the issue persists, open a support ticket with the Zyno console (type "wallet" + screenshot).',
    category: 'Support'
  },
  {
    id: 'mission-reset',
    question: 'Can I restart a journey from scratch?',
    answer: 'Yes, use the Reset button in Journeys to clear your local progress, then ask Zyno for a new mission script by selecting the desired persona. XP and NFTs will remain archived in your profile.',
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
              Get real-time help and share your feedback with Zyno
            </h1>
            <p className="text-sm text-white/75 lg:text-base">
              Builders should never be stuck. Deploy the knowledge base, contact a human agent, or
              run an automatic diagnostic on your journey.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-effect flex max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-white/10 p-6"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
              <span>Assistance Modes</span>
              <Sparkles size={16} className="text-accent-neon" />
            </div>
            <div className="space-y-3 text-sm text-white/75">
              <div className="flex items-center gap-3">
                <Bot size={18} />
                <span>Guided queries via Zyno</span>
              </div>
              <div className="flex items-center gap-3">
                <Headphones size={18} />
                <span>Escalation to MFAI team (24h)</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldAlert size={18} />
                <span>Critical incident alerts</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-effect flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <MessageSquare size={18} />
            Zyno Chat
          </div>
          <p className="text-sm text-white/70">
            Let Zyno contextualize your blocker and get step-by-step recommendations. Use the "help me" command in the console.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
          >
            Open Console
            <ArrowRight size={14} />
          </button>
        </article>

        <article className="glass-effect flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <Mail size={18} />
            Mission Control Email
          </div>
          <p className="text-sm text-white/70">
            Describe your issue with screenshots, wallet, and mission. We respond within 24h UTC with an action plan.
          </p>
          <a
            href="mailto:support@moneyfactory.ai"
            className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
          >
            Send Email
            <ArrowRight size={14} />
          </a>
        </article>

        <article className="glass-effect flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-white">
          <div className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
            <ListChecks size={18} />
            QA Checklist
          </div>
          <p className="text-sm text-white/70">
            Review the responsive audit, wallet connectivity, and backend synchronization before each demo.
          </p>
          <button
            type="button"
            className="mt-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-white/20"
          >
            Download Checklist
            <ArrowRight size={14} />
          </button>
        </article>
      </section>

      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <h2 className="text-xl font-semibold">Guided FAQ</h2>
            <p className="text-sm text-white/60">
              Filter by topic and open a ticket if an answer is missing.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <UserCheck size={14} />
            {displayedFaqs.length} results
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
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${isActive
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
