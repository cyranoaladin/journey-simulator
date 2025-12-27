import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useJourneyStore } from "../../store/journeyStore";
import { api } from '../../utils/api';
import { generateStableKey } from '../../utils/generateStableKey';
import { logger } from '../../utils/logger';
// TEMPORARILY DISABLED - import { useFavoritesStore } from "../../store/favoritesStore";
import type {
  ActionSuggestionsBlock,
  ChecklistBlock,
  DiagramBlock,
  DocumentBlock,
  EvaluationBlock,
  JourneyStepResponse,
  MissionBlock,
  NarrativeChoiceBlock,
  ProjectSelectionBlock,
  QuizBlock,
  ResourceBlock,
  ResourceItem,
  TextBlock,
  UIBlock,
  XpBlock,
} from "../../types/uiBlocks";
import GovernanceDashboard from "../Governance/GovernanceDashboard";
import IndicatorBlockComponent, { IndicatorBlock as IndicatorBlockType } from "./IndicatorBlock";
import InteractiveTemplateComponent, { InteractiveTemplateBlock as InteractiveTemplateBlockType } from "./InteractiveTemplateBlock";
import NarrativeChoice from "./NarrativeChoiceBlock";
// TEMPORARILY DISABLED - import { Star } from "lucide-react";

type MermaidModule = typeof import('mermaid');
type MermaidAPI = MermaidModule & {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string; }>;
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

function Checklist({ block }: { block: ChecklistBlock; }) {
  const [items, setItems] = useState(block.items);
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <ul className="space-y-2">
        {items.map((it, i) => {
          const itemKey = generateStableKey(it, 'checklist-item', ['label', 'id']);
          return (
            <li key={itemKey}>
              <label
                htmlFor={`${block.id || 'block'}-${itemKey}`}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  id={`${block.id}-${itemKey}`}
                  type="checkbox"
                  checked={!!it.checked}
                  onChange={() => {
                    // Extract nested function to reduce nesting depth
                    const toggleItem = (prev: typeof items) =>
                      prev.map((p, idx) => (idx === i ? { ...p, checked: !p.checked } : p));
                    setItems(toggleItem);
                  }}
                />
                <span>{it.label}              </span>
              </label>
            </li>
          );
        })}
      </ul>
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
      useJourneyStore.setState({ lastStep: nextStep });

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
          <div key={q.id} className="border border-white/10 rounded-lg p-3">
            <div className="font-medium mb-2">{q.question}</div>
            <div className="space-y-1">
              {(Array.isArray(q.options) ? q.options : []).map((opt, idx) => {
                const selected = answers[q.id] === idx;
                const isCorrect = showExplain && idx === q.correct_option_index;
                const isWrong = showExplain && selected && !isCorrect;

                // In certifying mode, don't show colors until submitted (showExplain is true)
                const showColors = showExplain;
                const optionKey = generateStableKey({ text: opt, questionId: q.id, index: idx }, 'quiz-option', ['text', 'questionId']);

                return (
                  <button
                    key={optionKey}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                    }
                    disabled={mode === "certifying" && showExplain} // Disable changes after submission
                    className={(() => {
                      // Simplify nested template literals
                      let baseClass = "w-full text-left px-3 py-2 rounded-md transition border";
                      if (selected) {
                        baseClass += " border-accent-cyan/60 bg-accent-cyan/10";
                      } else {
                        baseClass += " border-white/10 hover:border-white/20";
                      }
                      if (showColors && isCorrect) {
                        baseClass += " bg-green-600/20 border-green-500/50";
                      }
                      if (showColors && isWrong) {
                        baseClass += " bg-red-600/20 border-red-500/50";
                      }
                      return baseClass;
                    })()}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {showExplain && (
              <div className="text-xs mt-2 opacity-80">
                Explanation: {q.explanation}
              </div>
            )}
          </div>
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
            {submitting ? "Submitting..." : "Submit Certification"}
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
  const [error, setError] = useState<string | null>(null);
  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const updateProgress = useJourneyStore((s) => s.updateProgress);

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

      // Extract next_step from the response
      const nextStep = json.next_step || json;

      // Update global lastStep so renderer can show evaluation/xp blocks
      useJourneyStore.setState({ lastStep: nextStep });

      // Apply XP delta locally
      const xpDelta = Number(json?.rewards?.xp_delta || json?.next_state?.xp_delta || 0);
      if (
        !Number.isNaN(xpDelta) &&
        xpDelta > 0 &&
        typeof updateProgress === "function"
      ) {
        await updateProgress(xpDelta);
      }
      setValue("");
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
            className="w-full h-28 px-3 py-2 rounded bg-black/30 border border-white/10 font-mono"
          />
        )}
      </div>
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <button
        className="px-3 py-2 rounded bg-gradient-primary text-white disabled:opacity-50"
        disabled={submitting || !value.trim()}
        onClick={onSubmit}
      >
        {submitting ? "Sending..." : "Submit mission"}
      </button>
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

  // TEMPORARILY DISABLED - Favorites functionality
  // const { addFavorite, removeFavoriteByResourceId, isFavorite } = useFavoritesStore();
  // const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);

  // const toggleFavorite = async (r: ResourceItem) => {
  //   const journeyId = ensureApiJourneyId();
  //
  //   if (isFavorite(r.id)) {
  //     await removeFavoriteByResourceId(r.id);
  //   } else {
  //     await addFavorite({
  //       userId: 'anonymous',
  //       journeyId,
  //       resource: {
  //         id: r.id,
  //         label: r.label,
  //         description: r.description,
  //         url: r.url,
  //         resource_type: r.resource_type,
  //         agent_owner: r.agent_owner,
  //       },
  //     });
  //   }
  // };

  return (
    <div className="bg-white/5 rounded-xl p-4" data-testid="resources-section">
      <h4 className="font-semibold mb-2" data-testid="resources-section-title">{block.title}</h4>
      <div className="grid gap-2" data-testid="resources-list">
        {resources.map((r) => {
          // const favorited = isFavorite(r.id);
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
                  Proposed by {r.agent_owner} • {r.resource_type}
                </div>
              </div>
              <div className="flex gap-2">
                {r.url ? (
                  <a
                    className="px-3 py-1.5 rounded-md bg-accent-cyan/20 text-xs hover:bg-accent-cyan/30 transition-colors"
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
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
                {/* TEMPORARILY DISABLED - Favorite button
                <button
                  className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                    favorited
                      ? "bg-accent-gold/20 border border-accent-gold/50 hover:bg-accent-gold/30"
                      : "border border-white/10 hover:bg-white/5"
                  }`}
                  onClick={() => toggleFavorite(r)}
                  title={favorited ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  <Star
                    size={14}
                    className={favorited ? "fill-accent-gold text-accent-gold" : ""}
                  />
                </button>
                */}
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

// Helper to escape HTML entities
function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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
function processHeader(line: string, pattern: RegExp, tag: string, out: string[], inList: boolean): { processed: boolean; newInList: boolean } {
  if (pattern.test(line)) {
    const newInList = closeListIfOpen(out, inList);
    const content = line.replace(pattern, "");
    out.push(`<${tag}>${escapeHtml(content)}</${tag}>`);
    return { processed: true, newInList };
  }
  return { processed: false, newInList: inList };
}

// Helper to process list items
function processListItem(line: string, out: string[], inList: boolean): { processed: boolean; newInList: boolean } {
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

function renderBasicMarkdown(md: string) {
  // Escape user-controlled text first to prevent HTML/entity injection, then add a tiny subset of
  // safe markup (headers, lists, paragraphs).
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  for (const raw of lines) {
    const line = raw.trim();

    // Process headers (h3, h2, h1)
    const h3Result = processHeader(line, /^###\s+/, "h3", out, inList);
    if (h3Result.processed) {
      inList = h3Result.newInList;
      continue;
    }

    const h2Result = processHeader(line, /^##\s+/, "h2", out, inList);
    if (h2Result.processed) {
      inList = h2Result.newInList;
      continue;
    }

    const h1Result = processHeader(line, /^#\s+/, "h1", out, inList);
    if (h1Result.processed) {
      inList = h1Result.newInList;
      continue;
    }

    // Process list items
    const listResult = processListItem(line, out, inList);
    if (listResult.processed) {
      inList = listResult.newInList;
      continue;
    }

    // Process empty lines
    if (line === "") {
      inList = closeListIfOpen(out, inList);
      out.push("<br/>");
      continue;
    }

    // Default: paragraph
    out.push(`<p>${escapeHtml(line)}</p>`);
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
      useJourneyStore.setState({ lastStep: json });
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
            Diagramme Mermaid (chargement à la demande pour perf).
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
              ? '<div class="text-xs opacity-70">Loading diagram…</div>'
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
  if (!response || !response.ui_blocks) return null;

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
          return <NarrativeChoice key={b.id} block={b as NarrativeChoiceBlock} />;
        case "indicator_block":
          return <IndicatorBlockComponent key={b.id} block={b as IndicatorBlockType} />;
        case "interactive_template_block":
          return <InteractiveTemplateComponent key={b.id} block={b as InteractiveTemplateBlockType} />;
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
