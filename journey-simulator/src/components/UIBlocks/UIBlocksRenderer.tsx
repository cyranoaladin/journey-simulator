import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJourneyStore } from "../../store/journeyStore";
import { API_BASE_URL } from '../../utils/api';
// TEMPORARILY DISABLED - import { useFavoritesStore } from "../../store/favoritesStore";
import type {
  JourneyStepResponse,
  UIBlock,
  TextBlock,
  ChecklistBlock,
  QuizBlock,
  MissionBlock,
  ResourceBlock,
  ResourceItem,
  DocumentBlock,
  EvaluationBlock,
  ActionSuggestionsBlock,
  XpBlock,
  DiagramBlock,
  ProjectSelectionBlock,
  NarrativeChoiceBlock,
} from "../../types/uiBlocks";
import GovernanceDashboard from "../Governance/GovernanceDashboard";
import NarrativeChoice from "./NarrativeChoiceBlock";
import IndicatorBlockComponent, { IndicatorBlock as IndicatorBlockType } from "./IndicatorBlock";
import InteractiveTemplateComponent, { InteractiveTemplateBlock as InteractiveTemplateBlockType } from "./InteractiveTemplateBlock";
// TEMPORARILY DISABLED - import { Star } from "lucide-react";

type MermaidModule = typeof import('mermaid');
type MermaidAPI = MermaidModule & {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, definition: string) => Promise<{ svg: string }>;
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

function StreamingText({ text, speed = 10 }: { text: string; speed?: number }) {
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

function Text({ block }: { block: TextBlock }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <StreamingText text={block.body_markdown} speed={5} />
    </div>
  );
}

function Checklist({ block }: { block: ChecklistBlock }) {
  const [items, setItems] = useState(block.items);
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i}>
            <label
              htmlFor={`${block.id}-check-${i}`}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                id={`${block.id}-check-${i}`}
                type="checkbox"
                checked={!!it.checked}
                onChange={() =>
                  setItems((prev) =>
                    prev.map((p, idx) =>
                      idx === i ? { ...p, checked: !p.checked } : p,
                    ),
                  )
                }
              />
              <span>{it.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Quiz({ block }: { block: QuizBlock }) {
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showExplain, setShowExplain] = useState(false);
  const [mode, setMode] = useState<"training" | "certifying">("training");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);
  const updateProgress = useJourneyStore((s) => s.updateProgress);

  const score = block.questions.reduce(
    (acc, q) =>
      acc + ((answers[q.id] ?? -1) === q.correct_option_index ? 1 : 0),
    0,
  );

  const allAnswered = block.questions.every((q) => answers[q.id] !== undefined);

  const onSubmit = async () => {
    if (!allAnswered) return;

    try {
      setSubmitting(true);
      setError(null);
      const id = ensureApiJourneyId();

      const body = {
        missionId: block.id, // Using block ID as mission ID for quiz
        inputType: "quiz_submission",
        submission: JSON.stringify({
          answers,
          score,
          max_score: block.questions.length,
          mode: "certifying"
        }),
        language: "en",
        mode: "builder",
        tone: "pedagogical",
        trackId: selectedPersona?.id,
        phaseId: lastStep?.metadata?.phase_id,
        journeyState: useJourneyStore.getState().userProgress,
      };

      const resp = await fetch(`${API_BASE_URL}/journey/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) throw new Error(`submit failed: ${resp.status}`);
      const json = await resp.json();

      // Extract next_step from the response
      const nextStep = json.next_step || json;

      // Update global lastStep so renderer can show evaluation/xp blocks
      useJourneyStore.setState({ lastStep: nextStep });

      // Apply XP delta locally
      const xpDelta = Number(json?.rewards?.xp_delta || json?.next_state?.xp_delta || 0);
      if (
        !isNaN(xpDelta) &&
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
        {block.questions.map((q) => (
          <div key={q.id} className="border border-white/10 rounded-lg p-3">
            <div className="font-medium mb-2">{q.question}</div>
            <div className="space-y-1">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                const isCorrect = showExplain && idx === q.correct_option_index;
                const isWrong = showExplain && selected && !isCorrect;

                // In certifying mode, don't show colors until submitted (showExplain is true)
                const showColors = showExplain;

                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                    }
                    disabled={mode === "certifying" && showExplain} // Disable changes after submission
                    className={`w-full text-left px-3 py-2 rounded-md transition border ${selected
                      ? "border-accent-cyan/60 bg-accent-cyan/10"
                      : "border-white/10 hover:border-white/20"
                      } ${showColors && isCorrect ? "bg-green-600/20 border-green-500/50" : ""} ${showColors && isWrong ? "bg-red-600/20 border-red-500/50" : ""}`}
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

function Mission({ block }: { block: MissionBlock }) {
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
      const body = {
        missionId: block.id,
        inputType: block.expected_input_type,
        submission: value,
        language: "en",
        mode: "builder",
        tone: "pedagogical",
        trackId: selectedPersona?.id,
        phaseId: lastStep?.metadata?.phase_id,
        journeyState: useJourneyStore.getState().userProgress,
      };
      const resp = await fetch(`${API_BASE_URL}/journey/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`submit failed: ${resp.status}`);
      const json = await resp.json();

      // Extract next_step from the response
      const nextStep = json.next_step || json;

      // Update global lastStep so renderer can show evaluation/xp blocks
      useJourneyStore.setState({ lastStep: nextStep });

      // Apply XP delta locally
      const xpDelta = Number(json?.rewards?.xp_delta || json?.next_state?.xp_delta || 0);
      if (
        !isNaN(xpDelta) &&
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

function Resources({ block }: { block: ResourceBlock }) {
  const isFlashcards = (r: ResourceItem) => r.resource_type === 'flashcard';
  const copyDeck = (r: ResourceItem) => {
    const content = `# ${r.label}\n\n${r.description ?? ""}\n${r.url ?? ""}`;
    navigator.clipboard.writeText(content);
  };

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
        {block.resources.map((r) => {
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
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${r.label}\n${r.description ?? ""}\n${r.url ?? ""}`,
                    )
                  }
                  title="Copy information"
                >
                  Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function renderBasicMarkdown(md: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const lines = md.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^###\s+/.test(line)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3>${esc(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h2>${esc(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }
    if (/^#\s+/.test(line)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h1>${esc(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${esc(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    if (line === "") {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push("<br/>");
      continue;
    }
    out.push(`<p>${esc(line)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

function Document({ block }: { block: DocumentBlock }) {
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

function Evaluation({ block }: { block: EvaluationBlock }) {
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
        {(block.axes || []).map((ax, i) => {
          const maxScore = Math.max(ax.max_score ?? 0, 1);
          const scoreValue = Math.max(0, Math.min(ax.score ?? 0, maxScore));
          return (
            <div key={i} className="text-xs">
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

function ActionSuggestions({ block }: { block: ActionSuggestionsBlock }) {
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
      const resp = await fetch(`${base}/journey/${id}/step`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`step failed: ${resp.status}`);
      const json = await resp.json();
      useJourneyStore.setState({ lastStep: json });
    } catch (e: any) {
      console.error("ActionSuggestions step failed", e);
      const code = /step failed: (\d+)/.exec(e?.message || "")?.[1];
      setToastMsg(
        `Action failed${code ? ` (HTTP ${code})` : ""}. Please try again.`,
      );
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
        {block.suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onChoose(s.action_id)}
            disabled={!!busy}
            className={`px-3 py-2 rounded-md bg-gradient-primary text-white text-xs ${busy === s.action_id ? "opacity-60 cursor-wait" : ""}`}
          >
            {s.label}
          </button>
        ))}
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

function Xp({ block }: { block: XpBlock }) {
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

function Diagram({ block }: { block: DiagramBlock }) {
  const [svg, setSvg] = useState<string>(
    '<div class="text-xs opacity-70">Loading diagram...</div>'
  );

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const mermaid = await loadMermaid();

        if (!mermaidInitialized) {
          mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose" });
          mermaidInitialized = true;
        }

        const result = await mermaid.render(`mermaid-${block.id}`, block.content);
        if (!cancelled) {
          setSvg(result.svg);
        }
      } catch (e) {
        console.error("Mermaid render error:", e);
        if (!cancelled) {
          setSvg(`<div class="text-red-400 text-xs">Failed to render diagram</div>`);
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [block.content, block.id]);

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <div
        className="overflow-x-auto flex justify-center bg-black/20 rounded-lg p-4"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      {block.caption && (
        <div className="text-xs opacity-70 mt-2 text-center">{block.caption}</div>
      )}
    </div>
  );
}

function ProjectSelection({ block }: { block: ProjectSelectionBlock }) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-4">{block.title}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        {block.projects.map((p) => (
          <div
            key={p.id}
            onClick={() => setSelected(p.id)}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${selected === p.id
              ? "border-accent-cyan bg-accent-cyan/10"
              : "border-white/10 hover:border-white/20"
              }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h5 className="font-medium">{p.name}</h5>
              <span className="text-xs bg-white/10 px-2 py-1 rounded">
                {Math.round((p.currentFunding / p.fundingGoal) * 100)}% funded
              </span>
            </div>
            <p className="text-sm opacity-80 mb-3 line-clamp-2">
              {p.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {p.tags.map((t) => (
                <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
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

export default function UIBlocksRenderer({ response }: { response: JourneyStepResponse }) {
  if (!response || !response.ui_blocks) return null;

  const render = (b: UIBlock) => {
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
              onVote={(pid, vote) => console.log("Vote:", pid, vote)}
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
          const blockKey = b.id ? `${b.id}` : `${b.kind}-${index}`;

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
