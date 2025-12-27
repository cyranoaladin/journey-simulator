import { AECO, AEPO } from '@/content/aepoAeco';
import { motion } from 'framer-motion';
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
} from 'lucide-react';
import { useMemo, useState } from 'react';

const KNOWLEDGE_BASE_URL =
  import.meta.env.VITE_RESOURCE_LIBRARY_BASE_URL ??
  '/documents';

interface Resource {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  format: 'PDF' | 'Guide' | 'Template' | 'Playbook';
  slug: string;
  minutes: number;
  coverImage?: string;
}

const resourceLibrary: Resource[] = [
  {
    id: 'mfai-blueprint',
    title: 'MFAI System Blueprint',
    summary: 'Complete architecture of the Money Factory AI protocol and Zyno agents.',
    tags: ['Architecture', 'Protocol', 'Foundations'],
    format: 'PDF',
    slug: 'mfai-system-blueprint.html',
    minutes: 18
  },
  {
    id: 'protocol-paper',
    title: 'Protocol Whitepaper (EN)',
    summary: 'Strategic vision, economic primitives, and MFAI deployment roadmaps.',
    tags: ['Strategy', 'Tokenomics', 'Protocol'],
    format: 'PDF',
    slug: 'mfai-protocol-whitepaper-en.html',
    minutes: 22
  },
  {
    id: 'web3-transformation',
    title: 'Web2 ➝ Web3 Activation Guide',
    summary: 'Detailed pathway to transform a Web2 team into autonomous Web3 builders.',
    tags: ['Onboarding', 'Execution', 'Playbook'],
    format: 'Guide',
    slug: 'web2-to-web3-activation-guide.html',
    minutes: 14
  },
  {
    id: 'token-activation',
    title: 'Token Strategy Sprint Template',
    summary: 'Notion template to frame supply, utility, and token distribution scenarios.',
    tags: ['Tokenomics', 'Templates'],
    format: 'Template',
    slug: 'token-strategy-sprint-template.html',
    minutes: 9
  },
  {
    id: 'dao-starter',
    title: 'DAO Launch Starter Kit',
    summary: 'Operational checklist to register voters, quorum, and DAO roles.',
    tags: ['DAO', 'Governance', 'Execution'],
    format: 'Playbook',
    slug: 'dao-launch-starter-kit.html',
    minutes: 11
  },
  {
    id: 'pitch-deck',
    title: 'Pitch Deck Narrative Framework',
    summary: 'Slide-by-slide structure to showcase MFAI impact and agent KPIs.',
    tags: ['Fundraising', 'Storytelling'],
    format: 'Template',
    slug: 'pitch-deck-narrative-framework.html',
    minutes: 8
  },
  {
    id: 'rag-ingestion',
    title: 'RAG Ingestion Playbook',
    summary: 'Procedure to prepare, vectorize, and feed cognitive mesh documents.',
    tags: ['RAG', 'Agents', 'Data'],
    format: 'Guide',
    slug: 'rag-ingestion-playbook.html',
    minutes: 16
  },
  {
    id: 'mission-feedback',
    title: 'Mission Feedback Loops',
    summary: 'AEPO/AECO framework to capture, score, and recycle builder feedback.',
    tags: ['Analytics', 'Agents', 'Playbook'],
    format: 'Guide',
    slug: 'mission-feedback-loops.html',
    minutes: 7,
    coverImage: '/images/AECO_AEPO.png'
  }
];

const ResourceHub = () => {
  const [query, setQuery] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const tags = useMemo(() => {
    const all = new Set<string>();
    resourceLibrary.forEach((resource) => {
      resource.tags.forEach((tag) => all.add(tag));
    });
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag)
        ? prev.filter((item) => item !== tag)
        : [...prev, tag]
    );
  };

  const filteredResources = useMemo(() => {
    return resourceLibrary.filter((resource) => {
      const matchesQuery = query.trim().length === 0
        ? true
        : resource.title.toLowerCase().includes(query.toLowerCase()) ||
        resource.summary.toLowerCase().includes(query.toLowerCase());

      const matchesTags = activeTags.length === 0
        ? true
        : activeTags.every((tag) => resource.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  }, [query, activeTags]);

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
              Access MFAI playbooks and accelerate your missions
            </h1>
            <p className="text-sm text-white/75 lg:text-base">
              Tutorials, checklists, templates, and strategic frameworks tested with Zyno to save time
              and synchronize the entire product, governance, and tokenomics team.
            </p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-effect flex max-w-sm flex-col gap-4 rounded-2xl border border-white/10 bg-white/10 p-6 text-white"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/70">
              <span>Shortcuts</span>
              <Sparkles size={16} className="text-accent-neon" />
            </div>
            <div className="space-y-3 text-sm text-white/75">
              <div className="flex items-center gap-3">
                <BrainCircuit size={18} />
                <span>
                  Ready-to-use{' '}
                  <span title={AEPO.tooltip} className="cursor-help border-b border-dashed border-white/20">
                    AEPO
                  </span>
                  /
                  <span title={AECO.tooltip} className="cursor-help border-b border-dashed border-white/20">
                    AECO
                  </span>{' '}
                  playbooks
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Layers size={18} />
                <span>Seamless Product ⇄ Governance handoff</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={18} />
                <span>Multilingual documentation</span>
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
              placeholder="Search by keyword, e.g., tokenomics or DAO"
              className="w-full rounded-full border border-white/10 bg-white/5 py-3 pl-12 pr-6 text-sm text-white placeholder:text-white/50 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40"
              aria-label="Filter resources by keyword"
            />
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <Filter size={14} />
            Select tags to refine
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${isActive
                  ? 'bg-gradient-accent text-white shadow-glow'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
              >
                {tag}
              </button>
            );
          })}
          {activeTags.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTags([])}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/60 transition hover:text-white"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3 text-white">
          <div>
            <h2 className="text-xl font-semibold">Library sorted by missions</h2>
            <p className="text-sm text-white/60">
              {filteredResources.length} resources aligned with the Cognitive Activation Protocol.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
            <BookCopy size={14} />
            {resourceLibrary.length} docs
          </div>
        </header>

        {filteredResources.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/70">
            No results for &quot;{query}&quot;. Relax filters or explore another mission.
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
                {resource.coverImage ? (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    <img
                      src={resource.coverImage}
                      alt={`${resource.title} cover`}
                      className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  </div>
                ) : null}
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
                  Open resource
                  <ArrowUpRight size={14} />
                </a>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default ResourceHub;
