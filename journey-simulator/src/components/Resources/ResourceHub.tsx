import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BookCopy,
  BrainCircuit,
  Filter,
  Globe,
  Layers,
  Library,
  Search,
  Sparkles
} from 'lucide-react'

const KNOWLEDGE_BASE_URL =
  import.meta.env.VITE_RESOURCE_LIBRARY_BASE_URL ??
  'https://cdn.moneyfactory.ai/knowledge-vault'

interface Resource {
  id: string
  title: string
  summary: string
  tags: string[]
  format: 'PDF' | 'Guide' | 'Template' | 'Playbook'
  slug: string
  minutes: number
}

const resourceLibrary: Resource[] = [
  {
    id: 'mfai-blueprint',
    title: 'MFAI System Blueprint',
    summary: 'Architecture complète du protocole Money Factory AI et des agents Zyno.',
    tags: ['Architecture', 'Protocol', 'Foundations'],
    format: 'PDF',
    slug: 'mfai-system-blueprint.pdf',
    minutes: 18
  },
  {
    id: 'protocol-paper',
    title: 'Protocol Whitepaper (EN)',
    summary: 'Vision stratégique, primitives économiques et roadmaps de déploiement MFAI.',
    tags: ['Strategy', 'Tokenomics', 'Protocol'],
    format: 'PDF',
    slug: 'mfai-protocol-whitepaper-en.pdf',
    minutes: 22
  },
  {
    id: 'web3-transformation',
    title: 'Web2 ➝ Web3 Activation Guide',
    summary: 'Parcours détaillé pour transformer une équipe Web2 en builders Web3 autonomes.',
    tags: ['Onboarding', 'Execution', 'Playbook'],
    format: 'Guide',
    slug: 'web2-to-web3-activation-guide.pdf',
    minutes: 14
  },
  {
    id: 'token-activation',
    title: 'Token Strategy Sprint Template',
    summary: 'Template Notion pour cadrer supply, utilité et scénarios de distribution token.',
    tags: ['Tokenomics', 'Templates'],
    format: 'Template',
    slug: 'token-strategy-sprint-template.zip',
    minutes: 9
  },
  {
    id: 'dao-starter',
    title: 'DAO Launch Starter Kit',
    summary: 'Checklist opérationnelle pour enregistrer les électeurs, quorum et rôles DAO.',
    tags: ['DAO', 'Governance', 'Execution'],
    format: 'Playbook',
    slug: 'dao-launch-starter-kit.pdf',
    minutes: 11
  },
  {
    id: 'pitch-deck',
    title: 'Pitch Deck Narrative Framework',
    summary: 'Structure slide-by-slide pour mettre en scène l’impact MFAI et les KPIs agents.',
    tags: ['Fundraising', 'Storytelling'],
    format: 'Template',
    slug: 'pitch-deck-narrative-framework.pptx',
    minutes: 8
  },
  {
    id: 'rag-ingestion',
    title: 'RAG Ingestion Playbook',
    summary: 'Procédure pour préparer, vectoriser et alimenter les documents du cognitive mesh.',
    tags: ['RAG', 'Agents', 'Data'],
    format: 'Guide',
    slug: 'rag-ingestion-playbook.pdf',
    minutes: 16
  },
  {
    id: 'mission-feedback',
    title: 'Mission Feedback Loops',
    summary: 'Cadre AEPO/AECO pour capturer, scorer et recycler les retours builders.',
    tags: ['Analytics', 'Agents', 'Playbook'],
    format: 'Guide',
    slug: 'mission-feedback-loops.pdf',
    minutes: 7
  }
]

const ResourceHub = () => {
  const [query, setQuery] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])

  const tags = useMemo(() => {
    const all = new Set<string>()
    resourceLibrary.forEach((resource) => {
      resource.tags.forEach((tag) => all.add(tag))
    })
    return Array.from(all).sort()
  }, [])

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag]
    )
  }

  const filteredResources = useMemo(() => {
    return resourceLibrary.filter((resource) => {
      const matchesQuery = query.trim().length === 0
        ? true
        : resource.title.toLowerCase().includes(query.toLowerCase()) ||
          resource.summary.toLowerCase().includes(query.toLowerCase())

      const matchesTags = activeTags.length === 0
        ? true
        : activeTags.every((tag) => resource.tags.includes(tag))

      return matchesQuery && matchesTags
    })
  }, [query, activeTags])

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 lg:px-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-surface-900 via-primary-500/10 to-surface-900 p-8 shadow-glass"
      >
        <div className="absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-4 text-white">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              <Library size={14} />
              Knowledge Vault
            </span>
            <h1 className="text-3xl font-semibold lg:text-4xl">
              Accède aux playbooks MFAI et accélère tes missions
            </h1>
            <p className="text-sm text-white/75 lg:text-base">
              Tutoriaux, checklists, templates et cadres stratégiques testés avec Zyno pour gagner du temps
              et synchroniser toute l&apos;équipe produit, gouvernance et tokenomics.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-effect flex max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 p-6 text-white"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
              <span>Raccourcis</span>
              <Sparkles size={16} className="text-accent-neon" />
            </div>
            <div className="space-y-3 text-sm text-white/75">
              <div className="flex items-center gap-3">
                <BrainCircuit size={18} />
                <span>Templates AEPO/AECO prêts à l&apos;emploi</span>
              </div>
              <div className="flex items-center gap-3">
                <Layers size={18} />
                <span>Seamless handoff Produit ⇄ Gouvernance</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={18} />
                <span>Documentations multilingues</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-xl">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Chercher par mot-clé, ex: tokenomics ou DAO"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              aria-label="Filtrer les ressources par mot-clé"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <Filter size={14} />
            Sélectionne des tags pour affiner
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag)
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  isActive
                    ? 'bg-gradient-accent text-white shadow-glow'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                {tag}
              </button>
            )
          })}
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags([])}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <h2 className="text-xl font-semibold">Bibliothèque triée par missions</h2>
            <p className="text-sm text-white/60">
              {filteredResources.length} ressources alignées avec le Cognitive Activation Protocol.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <BookCopy size={14} />
            {resourceLibrary.length} docs
          </div>
        </header>

        {filteredResources.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/70">
            Aucun résultat pour « {query} ». Détends les filtres ou explore une autre mission.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredResources.map((resource, index) => (
              <motion.article
                key={resource.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="group flex h-full flex-col justify-between gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-white shadow-glass backdrop-blur"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                    <span>{resource.format}</span>
                    <span>{resource.minutes} min</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-accent-neon transition">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-white/70">{resource.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={`${KNOWLEDGE_BASE_URL}/${resource.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 transition hover:bg-white/20"
                >
                  Ouvrir la ressource
                  <ArrowUpRight size={14} />
                </a>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}

export default ResourceHub
