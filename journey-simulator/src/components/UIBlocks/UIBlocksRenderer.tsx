/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { AnimatePresence, motion } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";
import { AlertTriangle, Brain, ChevronDown, Database, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useJourneyStore } from "../../store/journeyStore";
import type {
  ActionSuggestionsBlock,
  ChecklistBlock,
  DiagramBlock,
  DocumentBlock,
  EvaluationBlock,
  JourneyStepResponse,
  MissionBlock,
  ProjectSelectionBlock,
  QuizBlock,
  ResourceBlock,
  ResourceItem,
  TextBlock,
  UIBlock,
  XpBlock,
} from "../../types/uiBlocks";
import { api } from '../../utils/api';
import { generateStableKey } from '../../utils/generateStableKey';
import { logger } from '../../utils/logger';
import GovernanceDashboard from "../Governance/GovernanceDashboard";
import IndicatorBlockComponent from "./IndicatorBlock";
import InteractiveTemplateComponent from "./InteractiveTemplateBlock";
import NarrativeChoice from "./NarrativeChoiceBlock";

type MermaidModule = typeof import('mermaid');
type MermaidAPI = MermaidModule & {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string; }>;
  parse?: (definition: string) => unknown;
};

let mermaidModule: MermaidAPI | null = null;
let mermaidLoader: Promise<MermaidAPI> | null = null;
let mermaidInitialized = false;

const loadMermaid = async (): Promise<MermaidAPI> => {
  if (mermaidModule) {
    return mermaidModule;
  }

  if (!mermaidLoader) {
    mermaidLoader = import('mermaid').then((module) => {
      const resolved = (module.default ?? module) as unknown as MermaidAPI;
      mermaidModule = resolved;
      return resolved;
    });
  }

  return mermaidLoader;
};

const validateMermaidSyntax = async (definition: string): Promise<void> => {
  const mermaid = await loadMermaid();
  if (typeof mermaid.parse === "function") {
    mermaid.parse(definition);
    return;
  }
  // Fallback: rely on render throwing if invalid; no-op here.
};

type SourceItem =
  | string
  | {
    id?: string;
    title?: string;
    source?: string;
    file_path?: string;
    score?: number;
  };

function ThoughtProcess({ reasoning }: { reasoning?: string | null; }) {
  const [open, setOpen] = useState(false);
  if (!reasoning) return null;
  return (
    <div className="mt-3 rounded-lg border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <Brain size={14} className="text-accent-cyan" />
          Voir le raisonnement de l'IA
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="px-3 pb-3 text-xs text-white/80 leading-relaxed whitespace-pre-wrap"
          >
            <StreamingText text={reasoning} speed={8} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SourceBadges({ sources }: { sources?: SourceItem[]; }) {
  if (!Array.isArray(sources) || sources.length === 0) return null;
  const filtered = sources
    .map((s) => {
      if (typeof s === "string") return { label: s, score: 1, source: s };
      const score = typeof s.score === "number" ? s.score : undefined;
      const label = s.title || s.file_path || s.source || s.id || "Source";
      return { label, score, source: s.source || s.file_path || s.id };
    })
    .filter((s) => s.score === undefined || s.score >= 0.6);

  if (!filtered.length) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2" data-testid="source-badges">
      {filtered.map((s) => {
        const isUnverified = (s.label || '').toUpperCase().includes('UNVERIFIED_LOCAL') || (s.source || '').toUpperCase().includes('UNVERIFIED_LOCAL');
        const score = s.score;
        const iconColor = isUnverified ? 'text-amber-300' : score && score >= 0.8 ? 'text-emerald-300' : 'text-accent-cyan';
        const badgeBg = isUnverified ? 'bg-amber-500/15 border-amber-300/40' : 'bg-accent-cyan/10 border-accent-cyan/40';
        const key = generateStableKey(s, 'source-badge', ['label', 'score', 'source']);
        const Icon = isUnverified ? AlertTriangle : score && score >= 0.8 ? ShieldCheck : Database;
        return (
          <span
            key={key}
            className={`inline-flex items-center gap-1 rounded-full border ${badgeBg} px-2 py-1 text-[11px] text-white/80`}
          >
            <Icon size={12} className={iconColor} />
            {s.label}
            {typeof score === "number" && (
              <span className="text-[10px] opacity-80">({score.toFixed(2)})</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function StreamingText({ text, speed = 10 }: { text: string; speed?: number; }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div
      className="prose prose-invert text-sm"
      dangerouslySetInnerHTML={{
        __html: renderBasicMarkdown(displayed),
      }}
    />
  );
}

function Text({ block }: { block: TextBlock; }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <StreamingText text={block.body_markdown} speed={5} />
    </div>
  );
}

interface ChecklistItemProps {
  readonly blockId?: string;
  readonly item: ChecklistBlock['items'][number];
  readonly onToggle: () => void;
}

function ChecklistItem({ blockId, item, onToggle }: ChecklistItemProps) {
  const itemKey = generateStableKey(item, 'checklist-item', ['label', 'id']);
  const inputId = `${blockId || 'block'}-${itemKey}`;
  return (
    <li key={itemKey}>
      <label htmlFor={inputId} className="flex items-center gap-2 cursor-pointer">
        <input id={inputId} type="checkbox" checked={!!item.checked} onChange={onToggle} />
        <span>{item.label}</span>
      </label>
    </li>
  );
}

function Checklist({ block }: { block: ChecklistBlock; }) {
  const [items, setItems] = useState(block.items);

  const handleToggle = (index: number) => {
    const toggleItem = (prev: typeof items) =>
      prev.map((p, idx) => (idx === index ? { ...p, checked: !p.checked } : p));
    setItems(toggleItem);
  };

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <ChecklistItem
            key={generateStableKey(it, 'checklist-item', ['label', 'id'])}
            blockId={block.id}
            item={it}
            onToggle={() => handleToggle(i)}
          />
        ))}
      </ul>
    </div>
  );
}

interface QuizOptionProps {
  readonly optionKey: string;
  readonly text: string;
  readonly selected: boolean;
  readonly isCorrect: boolean;
  readonly isWrong: boolean;
  readonly showColors: boolean;
  readonly disabled: boolean;
  readonly onSelect: () => void;
}

function QuizOptionButton({
  optionKey,
  text,
  selected,
  isCorrect,
  isWrong,
  showColors,
  disabled,
  onSelect
}: QuizOptionProps) {
  let baseClass = "w-full text-left px-3 py-2 rounded-md transition border";
  baseClass += selected ? " border-accent-cyan/60 bg-accent-cyan/10" : " border-white/10 hover:border-white/20";
  if (showColors && isCorrect) {
    baseClass += " bg-green-600/20 border-green-500/50";
  }
  if (showColors && isWrong) {
    baseClass += " bg-red-600/20 border-red-500/50";
  }

  return (
    <button
      key={optionKey}
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={baseClass}
    >
      {text}
    </button>
  );
}

interface QuizQuestionProps {
  readonly question: QuizBlock['questions'][number];
  readonly answers: Record<string, number | null>;
  readonly showExplain: boolean;
  readonly mode: "training" | "certifying";
  readonly onSelect: (questionId: string, optionIndex: number) => void;
}

function QuizQuestion({
  question,
  answers,
  showExplain,
  mode,
  onSelect
}: QuizQuestionProps) {
  const options = Array.isArray(question.options) ? question.options : [];
  return (
    <div className="border border-white/10 rounded-lg p-3">
      <div className="font-medium mb-2">{question.question}</div>
      <div className="space-y-1">
        {options.map((opt, idx) => {
          const selected = answers[question.id] === idx;
          const isCorrect = showExplain && idx === question.correct_option_index;
          const isWrong = showExplain && selected && !isCorrect;
          const optionKey = generateStableKey(
            { text: opt, questionId: question.id, index: idx },
            'quiz-option',
            ['text', 'questionId']
          );

          return (
            <QuizOptionButton
              key={optionKey}
              optionKey={optionKey}
              text={opt}
              selected={selected}
              isCorrect={isCorrect}
              isWrong={isWrong}
              showColors={showExplain}
              disabled={mode === "certifying" && showExplain}
              onSelect={() => onSelect(question.id, idx)}
            />
          );
        })}
      </div>
      {showExplain && (
        <div className="text-xs mt-2 opacity-80">
          Explanation: {question.explanation}
        </div>
      )}
    </div>
  );
}

function Quiz({ block }: { block: QuizBlock; }) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showExplain, setShowExplain] = useState(false);
  const [mode, setMode] = useState<"training" | "certifying">("training");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const questions = Array.isArray(block.questions) ? block.questions : [];

  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const updateProgress = useJourneyStore((s) => s.updateProgress);
  const setLastStep = useJourneyStore((s) => s.setLastStep);

  const score = questions.reduce(
    (acc, q) =>
      acc + ((answers[q.id] ?? -1) === q.correct_option_index ? 1 : 0),
    0,
  );

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const onSubmit = async () => {
    if (!allAnswered) return;

    try {
      setSubmitting(true);
      setError(null);
      const id = ensureApiJourneyId();
      const phaseId = lastStep?.metadata?.phase_id ?? "unknown";
      const phaseNumber = (useJourneyStore.getState().currentPhase ?? 0) + 1;
      const trackId = selectedPersona?.id ?? "unknown";

      const body = {
        missionId: block.id, // Using block ID as mission ID for quiz
        inputType: "quiz_submission",
        submission: JSON.stringify({
          answers,
          score,
          max_score: questions.length,
          mode: "certifying"
        }),
        language: "en",
        mode: "builder",
        tone: "pedagogical",
        trackId,
        phaseId,
        phaseNumber,
        journeyState: useJourneyStore.getState().userProgress,
      };
      const json = await api.submitMission(id, body);

      // Extract next_step from the response
      const nextStep = json.next_step || json;

      // Update global lastStep so renderer can show evaluation/xp blocks
      setLastStep(nextStep);

      // Apply XP delta locally
      const xpDelta = Number(json?.rewards?.xp_delta || json?.next_state?.xp_delta || 0);
      if (
        !Number.isNaN(xpDelta) &&
        xpDelta > 0 &&
        typeof updateProgress === "function"
      ) {
        await updateProgress(xpDelta);
      }

      // Show explanations after submission
      setShowExplain(true);

    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{block.title}</h4>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="opacity-70">Mode</span>
          <div className="inline-flex rounded-md overflow-hidden border border-white/10">
            <button
              className={`px-3 py-1.5 transition-colors ${mode === "training" ? "bg-accent-cyan/20 text-accent-cyan font-medium" : "bg-transparent hover:bg-white/5"}`}
              onClick={() => {
                setMode("training");
                setShowExplain(false);
                setAnswers({});
              }}
            >
              Training
            </button>
            <button
              className={`px-3 py-1.5 transition-colors ${mode === "certifying" ? "bg-accent-purple/20 text-accent-purple font-medium" : "bg-transparent hover:bg-white/5"}`}
              onClick={() => {
                setMode("certifying");
                setShowExplain(false);
                setAnswers({});
              }}
            >
              Certifying
            </button>
          </div>
        </div>
      </div>

      {mode === "certifying" && (
        <div className="mb-4 p-3 rounded bg-accent-purple/10 border border-accent-purple/20 text-xs text-accent-purple/90">
          <strong>Certifying Mode:</strong> Answer all questions to submit. Your score will be recorded and XP awarded.
        </div>
      )}

      <div className="space-y-4">
        {questions.map((q) => (
          <QuizQuestion
            key={q.id}
            question={q}
            answers={answers}
            showExplain={showExplain}
            mode={mode}
            onSelect={(questionId, optionIndex) =>
              setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }))
            }
          />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {mode === "training" && (
            <button
              className="px-3 py-2 rounded-md bg-accent-cyan/20 hover:bg-accent-cyan/30 transition-colors text-sm"
              onClick={() => setShowExplain(true)}
            >
              Check Answers
            </button>
          )}

          <button
            className="px-3 py-2 rounded-md border border-white/10 hover:bg-white/5 transition-colors text-sm"
            onClick={() => {
              setAnswers({});
              setShowExplain(false);
              setError(null);
            }}
          >
            Reset
          </button>
        </div>

        {mode === "certifying" && !showExplain && (
          <button
            className="px-4 py-2 rounded-md bg-gradient-primary text-white disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            disabled={!allAnswered || submitting}
            onClick={onSubmit}
          >
            {submitting ? "Submitting..." : "Submit Certificate"}
          </button>
        )}

        {score !== null && showExplain && (
          <span className="text-sm font-medium">
            Score: <span className={score === block.questions.length ? "text-green-400" : "text-white"}>{score}/{block.questions.length}</span>
          </span>
        )}
      </div>
      {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
    </div>
  );
}

function Mission({ block }: { block: MissionBlock; }) {
  const [showHelp, setShowHelp] = useState(false);
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const apiJourneyId = useJourneyStore((s) => s.apiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const updateProgress = useJourneyStore((s) => s.updateProgress);
  const setLastStep = useJourneyStore((s) => s.setLastStep);
  const { isAuthenticated } = useAuth();
  const isSyncing = !apiJourneyId;

  const onSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      const id = ensureApiJourneyId();
      const phaseId = lastStep?.metadata?.phase_id ?? "unknown";
      const phaseNumber = (useJourneyStore.getState().currentPhase ?? 0) + 1;
      const trackId = selectedPersona?.id ?? "unknown";
      const body = {
        missionId: block.id,
        inputType: block.expected_input_type,
        submission: value,
        language: "en",
        mode: "builder",
        tone: "pedagogical",
        trackId,
        phaseId,
        phaseNumber,
        journeyState: useJourneyStore.getState().userProgress,
      };
      const json = await api.submitMission(id, body);

      setIsSubmitted(true);

      // Extract next_step from the response
      const nextStep = json.next_step || json;

      // Delay transition to allow user to see the success message
      setTimeout(async () => {
        // Update global lastStep so renderer can show evaluation/xp blocks
        setLastStep(nextStep);

        // Apply XP delta locally
        const xpDelta = Number(json?.rewards?.xp_delta || json?.next_state?.xp_delta || 0);
        if (
          !Number.isNaN(xpDelta) &&
          xpDelta > 0 &&
          typeof updateProgress === "function"
        ) {
          await updateProgress(xpDelta);
        }
      }, 2500);

      setValue("");
    } catch (e: any) {
      setError(e?.message || String(e));
      setSubmitting(false); // Only unset submitting on error, otherwise keep it true while showing success
    } finally {
      // If success, we keep submitting=true/isSubmitted=true until unmount or timeout
      if (error) setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white/5 rounded-xl p-6 text-center border border-green-500/30 bg-green-500/10 animate-fade-in">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h4 className="font-semibold text-green-100">Deliverable Received!</h4>
          <p className="text-xs text-green-200/80 max-w-[250px]">
            Your mission has been submitted internally. The analysis agent is processing your input.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="mt-2 text-[11px] underline opacity-60 hover:opacity-100"
          >
            Submit another version
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 rounded-xl p-4">
      {!isAuthenticated && (
        <div className="mb-3 rounded-md border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Mode Démo : Connectez-vous pour sauvegarder votre progression réelle.
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{block.title}</h4>
        <div className="text-xs opacity-70">XP: {block.xp_reward}</div>
      </div>
      <p className="text-sm opacity-90 mb-3">{block.description}</p>
      <div className="flex gap-2 mb-3">
        <button
          className="px-3 py-1.5 rounded-md border border-white/10"
          onClick={() => setShowHelp((v) => !v)}
        >
          Understand the mission
        </button>
        {block.nft_reward_id && (
          <span className="px-2 py-1 text-xs rounded bg-accent-purple/20">
            Proof: {block.nft_reward_id}
          </span>
        )}
      </div>
      {showHelp && (
        <div className="text-xs bg-black/30 rounded-md p-2 mb-2">
          Tip: provide a deliverable adapted to the type{" "}
          {block.expected_input_type}. An agent will evaluate your production and
          offer actionable feedback.
        </div>
      )}

      {/* Submission input */}
      <div className="space-y-2 mb-2">
        {block.expected_input_type === "link" ? (
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="https://..."
            aria-label={`Submission link for ${block.title}`}
            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10"
          />
        ) : (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={
              block.expected_input_type === "code_snippet"
                ? "Paste code here..."
                : "Describe your deliverable..."
            }
            aria-label={`Submission text for ${block.title}`}
            className="w-full h-28 px-3 py-2 rounded bg-black/30 border border-white/10 font-mono"
          />
        )}
      </div>
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <button
        className="px-3 py-2 rounded bg-gradient-primary text-white disabled:opacity-50"
        disabled={submitting || !value.trim() || isSyncing}
        onClick={onSubmit}
      >
        {isSyncing ? "Synchronisation..." : submitting ? "ZYNO IS THINKING..." : "Submit mission"}
      </button>
      {isSyncing && (
        <div className="mt-2 text-[11px] text-amber-200 opacity-90">
          En attente de synchronisation avec la blockchain...
        </div>
      )}
      {submitting && !isSyncing && (
        <div className="mt-2 text-[11px] text-cyan-200 opacity-90">
          ZYNO IS THINKING... analyse en cours.
        </div>
      )}
    </div>
  );
}

function Resources({ block }: { block: ResourceBlock; }) {
  const isFlashcards = (r: ResourceItem) => r.resource_type === 'flashcard';
  const copyDeck = (r: ResourceItem) => {
    // Simplify nested template literal
    const label = r.label || "";
    const description = r.description ?? "";
    const url = r.url ?? "";
    const content = `# ${label}\n\n${description}\n${url}`;
    navigator.clipboard.writeText(content);
  };
  const resources = Array.isArray(block.resources) ? block.resources : [];

  return (
    <div className="bg-white/5 rounded-xl p-4" data-testid="resources-section">
      <h4 className="font-semibold mb-2" data-testid="resources-section-title">{block.title}</h4>
      <ThoughtProcess reasoning={(block as any).reasoning ?? (block as any).feedback?.reasoning} />
      <SourceBadges sources={(block as any).sources} />
      <div className="grid gap-2 mt-2" data-testid="resources-list">
        {resources.map((r) => {
          return (
            <div
              key={r.id}
              className="border border-white/10 rounded-lg p-3 flex items-center justify-between"
              data-testid={`resource-item-${r.id}`}
            >
              <div>
                <div className="font-medium">{r.label}</div>
                {r.description && (
                  <div className="text-xs opacity-80">{r.description}</div>
                )}
                <div className="text-[11px] opacity-70 mt-1">
                  Proposed by {r.agent_owner}  {r.resource_type}
                </div>
              </div>
              <div className="flex gap-2">
                {r.url ? (
                  <a
                    className="px-3 py-1.5 rounded-md bg-accent-cyan/20 text-xs hover:bg-accent-cyan/30 transition-colors"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open resource: ${r.label}`}
                  >
                    Open
                  </a>
                ) : (
                  <a
                    className="px-3 py-1.5 rounded-md bg-white/10 text-xs hover:bg-white/20 transition-colors"
                    href={`https://www.google.com/search?q=${encodeURIComponent(r.label + " " + (r.resource_type || ""))}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Search
                  </a>
                )}
                {isFlashcards(r) && (
                  <button
                    className="px-3 py-1.5 rounded-md bg-accent-purple/20 text-xs hover:bg-accent-purple/30 transition-colors"
                    onClick={() => copyDeck(r)}
                  >
                    Flashcards
                  </button>
                )}
                <button
                  className="px-3 py-1.5 rounded-md border border-white/10 text-xs hover:bg-white/5 transition-colors"
                  onClick={() => {
                    // Simplify nested template literal
                    const label = r.label || "";
                    const description = r.description ?? "";
                    const url = r.url ?? "";
                    navigator.clipboard.writeText(`${label}\n${description}\n${url}`);
                  }}
                  title="Copy information"
                >
                  Copy
                </button>
              </div>
            </div>
          );
        })}
        {resources.length === 0 && (
          <div className="text-xs opacity-70">No resources available.</div>
        )}
      </div>
    </div>
  );
}

// Helper to escape HTML entities using a single pass to avoid missed cases
function escapeHtml(s: string): string {
  const escapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return s.replace(/[&<>"']/g, match => escapeMap[match] ?? match);
}

// Helper to close list if open
function closeListIfOpen(out: string[], inList: boolean): boolean {
  if (inList) {
    out.push("</ul>");
    return false;
  }
  return inList;
}

// Helper to process header lines
function processHeader(line: string, pattern: RegExp, tag: string, out: string[], inList: boolean): { processed: boolean; newInList: boolean; } {
  if (pattern.test(line)) {
    const newInList = closeListIfOpen(out, inList);
    const content = line.replace(pattern, "");
    out.push(`<${tag}>${escapeHtml(content)}</${tag}>`);
    return { processed: true, newInList };
  }
  return { processed: false, newInList: inList };
}

// Helper to process list items
function processListItem(line: string, out: string[], inList: boolean): { processed: boolean; newInList: boolean; } {
  if (/^[-*]\s+/.test(line)) {
    if (!inList) {
      out.push("<ul>");
    }
    const content = line.replace(/^[-*]\s+/, "");
    out.push(`<li>${escapeHtml(content)}</li>`);
    return { processed: true, newInList: true };
  }
  return { processed: false, newInList: inList };
}

// Helper to process a single line and return the new list state
function processLine(
  line: string,
  out: string[],
  inList: boolean
): boolean {
  // Strategy pattern for different line types
  const headerStrategies = [
    { pattern: /^###\s+/, tag: "h3" },
    { pattern: /^##\s+/, tag: "h2" },
    { pattern: /^#\s+/, tag: "h1" }
  ];

  for (const { pattern, tag } of headerStrategies) {
    const res = processHeader(line, pattern, tag, out, inList);
    if (res.processed) return res.newInList;
  }

  const listRes = processListItem(line, out, inList);
  if (listRes.processed) return listRes.newInList;

  if (line === "") {
    closeListIfOpen(out, inList);
    out.push("<br/>");
    return false;
  }

  // Default: paragraph or math
  const mathLine = line.match(/^\$\$(.*)\$\$$/);
  if (mathLine) {
    closeListIfOpen(out, inList);
    const rendered = renderMath(mathLine[1].trim());
    out.push(`<div class="math-block font-mono text-accent-cyan/90 text-sm">${rendered}</div>`);
    return false;
  }
  out.push(`<p>${escapeHtml(line)}</p>`);
  return inList;
}

function renderMath(formula: string): string {
  try {
    return katex.renderToString(formula, { throwOnError: false, output: "html" });
  } catch {
    return escapeHtml(formula);
  }
}

function renderBasicMarkdown(md: string) {
  // Escape user-controlled text first to prevent HTML/entity injection, then add a tiny subset of
  // safe markup (headers, lists, paragraphs).
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    inList = processLine(raw.trim(), out, inList);
  }

  if (inList) out.push("</ul>");
  return out.join("\n");
}

function Document({ block }: { block: DocumentBlock; }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">
        {block.title}{" "}
        <span className="text-xs opacity-70">({block.doc_type})</span>
      </h4>
      <ThoughtProcess reasoning={(block as any).reasoning ?? (block as any).feedback?.reasoning} />
      <SourceBadges sources={(block as any).sources} />
      <div
        className="prose prose-invert text-xs"
        dangerouslySetInnerHTML={{
          __html: renderBasicMarkdown(block.content_markdown),
        }}
      />
    </div>
  );
}

function Evaluation({ block }: { block: EvaluationBlock; }) {
  logger.debug('Evaluation block:', block);
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{block.title}</h4>
        <div className="text-xs">
          Score: {block.global_score}/{block.max_score}
        </div>
      </div>
      <p className="text-sm opacity-90 mb-2">{block.feedback}</p>
      <div className="grid gap-2">
        {(block.axes || []).map((ax) => {
          const maxScore = Math.max(ax.max_score ?? 0, 1);
          const scoreValue = Math.max(0, Math.min(ax.score ?? 0, maxScore));
          const axisKey = generateStableKey(ax, 'evaluation-axis', ['name', 'id']);
          return (
            <div key={axisKey} className="text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ax.name}</span>
                <span>
                  {ax.score}/{ax.max_score}
                </span>
              </div>
              <progress
                className="w-full h-1.5 overflow-hidden rounded bg-white/10 [appearance:none] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-accent-cyan [&::-moz-progress-bar]:bg-accent-cyan"
                value={scoreValue}
                max={maxScore}
                aria-label={`Score ${ax.name}`}
              />
              <div className="opacity-80 mt-1">{ax.comment}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActionSuggestions({ block }: { block: ActionSuggestionsBlock; }) {
  logger.debug('ActionSuggestions block:', block);
  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const setLastStep = useJourneyStore((s) => s.setLastStep);
  const [busy, setBusy] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lastFailedActionId, setLastFailedActionId] = useState<string | null>(
    null,
  );
  const setIsStepLoading = useJourneyStore((s) => s.setIsStepLoading);

  useEffect(() => {
    if (!toastMsg) return;
    const t = setTimeout(() => setToastMsg(null), 5000);
    return () => clearTimeout(t);
  }, [toastMsg]);

  const onChoose = async (actionId: string) => {
    try {
      setBusy(actionId);
      const id = ensureApiJourneyId();
      const base =
        (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:3000";
      const body = {
        phaseId: lastStep?.metadata?.phase_id || "learn",
        trackId: selectedPersona?.id || "builder",
        userInput: `action_id=${actionId}`,
        actionId,
        language: (lastStep?.metadata?.language || "en") as "fr" | "en",
        mode: (lastStep?.metadata?.mode || "discovery") as
          | "discovery"
          | "builder"
          | "expert",
        tone: (lastStep?.metadata?.tone || "pedagogical") as
          | "pedagogical"
          | "investor_pitch"
          | "critical",
        journeyState: useJourneyStore.getState().userProgress,
      };
      setIsStepLoading(true);
      const response = await fetch(`${base}/journey/${id}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error(`step failed: ${response.status}`);
      const json = await response.json();
      setLastStep(json);
    } catch (e: any) {
      console.error("ActionSuggestions step failed", e);
      // Simplify nested template literal
      const code = /step failed: (\d+)/.exec(e?.message || "")?.[1];
      let toastMessage = "Action failed";
      if (code) {
        toastMessage += ` (HTTP ${code})`;
      }
      toastMessage += ". Please try again.";
      setToastMsg(toastMessage);
      setLastFailedActionId(actionId);
    } finally {
      setBusy(null);
      setIsStepLoading(false);
    }
  };

  return (
    <div className="bg-white/5 rounded-xl p-4 relative">
      <h4 className="font-semibold mb-3">{block.title}</h4>
      <div className="flex flex-wrap gap-2">
        {(block.suggestions || []).map((s) => {
          const suggestionKey = generateStableKey(s, 'suggestion', ['action_id', 'label']);
          return (
            <button
              key={suggestionKey}
              onClick={() => onChoose(s.action_id)}
              disabled={!!busy}
              className={`px-3 py-2 rounded-md bg-gradient-primary text-white text-xs ${busy === s.action_id ? "opacity-60 cursor-wait" : ""}`}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, y: 20 }}
            data-testid="action-suggestions-toast"
            className="fixed bottom-4 right-4 z-50 rounded-lg shadow-lg bg-red-600/90 text-white border border-white/20 p-3 w-[320px]"
          >
            <div className="text-sm font-semibold mb-1">
              Action unavailable
            </div>
            <div className="text-xs opacity-90">{toastMsg}</div>
            <div className="mt-2 flex gap-2 justify-end">
              {lastFailedActionId && (
                <button
                  onClick={() => {
                    setToastMsg(null);
                    onChoose(lastFailedActionId);
                  }}
                  className="text-xs px-2 py-1 rounded bg-white/15 hover:bg-white/25 border border-white/30"
                >
                  Retry
                </button>
              )}
              <button
                onClick={() => setToastMsg(null)}
                className="text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Xp({ block }: { block: XpBlock; }) {
  const safeMax = Math.max(block.next_level_xp ?? 0, block.current_xp ?? 0, 1);
  const current = Math.max(0, Math.min(safeMax, block.current_xp ?? 0));

  return (
    <div className="bg-white/5 rounded-xl p-4 relative overflow-visible">
      <div className="flex justify-between items-end mb-1">
        <h4 className="font-semibold">{block.title ?? "Progress"}</h4>
        <AnimatePresence>
          {block.gained_xp > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: -20, scale: 1.2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute right-4 -top-2 text-accent-cyan font-bold text-xl shadow-glow"
            >
              +{block.gained_xp} XP
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <progress
        className="w-full h-2 overflow-hidden rounded bg-white/10 [appearance:none] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-accent-cyan [&::-moz-progress-bar]:bg-accent-cyan"
        value={current}
        max={safeMax}
        aria-label="XP Progress"
      />
      <div className="text-xs mt-1 opacity-80">
        {block.current_xp}/{block.next_level_xp} XP
      </div>
      {block.comment && (
        <div className="text-xs opacity-70 mt-1">{block.comment}</div>
      )}
    </div>
  );
}

function Diagram({ block }: { block: DiagramBlock; }) {
  const [shouldRender, setShouldRender] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [svg, setSvg] = useState<string>("");

  const diagramId = useMemo(() => `mermaid-${block.id}`, [block.id]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    let cancelled = false;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        const mermaid = await loadMermaid();
        try {
          await validateMermaidSyntax(block.content);
        } catch (validationError) {
          setSvg('<div class="text-xs text-red-300">Diagramme Mermaid invalide</div>');
          logger.warn("Mermaid syntax validation failed", validationError);
          return;
        }

        if (!mermaidInitialized) {
          // Strict mode avoids allowing raw HTML/links injection in the generated SVG.
          mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "strict" });
          mermaidInitialized = true;
        }

        const result = await mermaid.render(diagramId, block.content);
        if (!cancelled) {
          // Mermaid returns SVG. Sanitize before injecting into the DOM.
          try {
            const dompurifyMod: any = await import("dompurify");
            const DOMPurify: any = dompurifyMod?.default ?? dompurifyMod;
            const sanitized =
              typeof DOMPurify?.sanitize === "function"
                ? DOMPurify.sanitize(result.svg, {
                  USE_PROFILES: { svg: true, svgFilters: true },
                })
                : result.svg;
            setSvg(sanitized);
          } catch (sanitizeError) {
            logger.warn("Mermaid SVG sanitize failed, rendering raw SVG", sanitizeError);
            setSvg(result.svg);
          }
        }
      } catch (e) {
        logger.error("Mermaid render error:", e);
        if (!cancelled) {
          setSvg(`<div class="text-red-400 text-xs">Failed to render diagram</div>`);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [block.content, diagramId, shouldRender]);

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      {!shouldRender ? (
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="text-xs opacity-80">
            Mermaid diagram (lazy loaded for perf).
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded bg-white/10 hover:bg-white/15 transition-colors text-sm"
              onClick={() => setShouldRender(true)}
              data-testid={`render-diagram-${block.id}`}
            >
              Rendre le diagramme
            </button>
            <span className="text-[11px] opacity-60">
              (charge Mermaid uniquement au clic)
            </span>
          </div>
        </div>
      ) : (
        <div
          className="overflow-x-auto flex justify-center bg-black/20 rounded-lg p-4 min-h-[120px]"
          dangerouslySetInnerHTML={{
            __html: isLoading
              ? '<div class="text-xs opacity-70">Loading diagram</div>'
              : (svg || '<div class="text-xs opacity-70">Diagram empty.</div>'),
          }}
        />
      )}
      {block.caption && (
        <div className="text-xs opacity-70 mt-2 text-center">{block.caption}</div>
      )}
    </div>
  );
}

function ProjectSelection({ block }: { block: ProjectSelectionBlock; }) {
  const [selected, setSelected] = useState<string | null>(null);
  const projects = Array.isArray(block.projects) ? block.projects : [];
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-4">{block.title}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p.id)}
            type="button"
            aria-label={`Select project ${p.name || p.id}`}
            className={`p-4 rounded-lg border cursor-pointer transition-all text-left w-full ${selected === p.id
              ? "border-accent-cyan bg-accent-cyan/10"
              : "border-white/10 hover:border-white/20"
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium">{p.name}</h5>
              <span className="text-xs bg-white/10 px-2 py-1 rounded">
                {p.fundingGoal ? Math.round((p.currentFunding / p.fundingGoal) * 100) : 0}% funded
              </span>
            </div>
            <p className="text-sm opacity-80 mb-3 line-clamp-2">
              {p.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {(Array.isArray(p.tags) ? p.tags : []).map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">
                  {t}
                </span>
              ))}
            </div>
          </button>
        ))}
        {projects.length === 0 && (
          <div className="text-xs opacity-70">No projects available.</div>
        )}
      </div>
      {selected && (
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-2 rounded-md bg-gradient-primary text-white text-sm font-medium">
            Confirm selection
          </button>
        </div>
      )}
    </div>
  );
}

export default function UIBlocksRenderer({ response }: { response: JourneyStepResponse; }) {
  if (!response?.ui_blocks) return null;

  const render = (b: UIBlock) => {
    try {
      switch (b.kind) {
        case "text_block":
          return <Text key={b.id} block={b} />;
        case "checklist_block":
          return <Checklist key={b.id} block={b} />;
        case "quiz_block":
          return <Quiz key={b.id} block={b} />;
        case "mission_block":
          return <Mission key={b.id} block={b} />;
        case "resource_block":
          return <Resources key={b.id} block={b} />;
        case "document_block":
          return <Document key={b.id} block={b} />;
        case "evaluation_block":
          return <Evaluation key={b.id} block={b} />;
        case "action_suggestions_block":
          return <ActionSuggestions key={b.id} block={b} />;
        case "xp_block":
          return <Xp key={b.id} block={b} />;
        case "diagram_block":
          return <Diagram key={b.id} block={b} />;
        case "dao_dashboard_block":
          return (
            <div className="bg-white/5 rounded-xl p-4" key={b.id}>
              <h4 className="font-semibold mb-4">{b.title}</h4>
              <GovernanceDashboard
                votingPower={b.votingPower}
                proposals={b.proposals}
                onVote={(pid, vote) => logger.debug("Vote:", pid, vote)}
              />
            </div>
          );
        case "project_selection_block":
          return <ProjectSelection key={b.id} block={b} />;
        case "narrative_choice_block":
          return <NarrativeChoice key={b.id} block={b} />;
        case "indicator_block":
          return <IndicatorBlockComponent key={b.id} block={b} />;
        case "interactive_template_block":
          return <InteractiveTemplateComponent key={b.id} block={b} />;
        default:
          return null;
      }
    } catch (error) {
      console.error('Error rendering block:', b.kind, error);
      return null;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <AnimatePresence>
        {response.ui_blocks.map((b, index) => {
          logger.debug('Rendering block:', b);
          // Simplify nested template literal
          const blockId = b.id || "";
          const blockKind = b.kind || "block";
          const blockKey = blockId ? blockId : `${blockKind}-${index}`;

          return (
            <motion.div
              key={blockKey}
              variants={item}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="origin-top"
            >
              {render(b)}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
