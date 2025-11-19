import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJourneyStore } from "../../store/journeyStore";
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
} from "../../types/uiBlocks";

function Text({ block }: { block: TextBlock }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <div
        className="prose prose-invert text-sm"
        dangerouslySetInnerHTML={{
          __html: renderBasicMarkdown(block.body_markdown),
        }}
      />
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
  const score =
    showExplain && mode === "certifying"
      ? block.questions.reduce(
          (acc, q) =>
            acc + ((answers[q.id] ?? -1) === q.correct_option_index ? 1 : 0),
          0,
        )
      : null;
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold">{block.title}</h4>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="opacity-70">Mode</span>
          <div className="inline-flex rounded-md overflow-hidden border border-white/10">
            <button
              className={`px-2 py-1 ${mode === "training" ? "bg-accent-cyan/20" : "bg-transparent"}`}
              onClick={() => setMode("training")}
            >
              Entraînement
            </button>
            <button
              className={`px-2 py-1 ${mode === "certifying" ? "bg-accent-purple/20" : "bg-transparent"}`}
              onClick={() => setMode("certifying")}
            >
              Certifiant
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {block.questions.map((q) => (
          <div key={q.id} className="border border-white/10 rounded-lg p-3">
            <div className="font-medium mb-2">{q.question}</div>
            <div className="space-y-1">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx;
                const isCorrect = showExplain && idx === q.correct_option_index;
                const isWrong = showExplain && selected && !isCorrect;
                return (
                  <button
                    key={idx}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: idx }))
                    }
                    className={`w-full text-left px-3 py-2 rounded-md transition border ${
                      selected
                        ? "border-accent-cyan/60 bg-accent-cyan/10"
                        : "border-white/10 hover:border-white/20"
                    } ${isCorrect ? "bg-green-600/20 border-green-500/50" : ""} ${isWrong ? "bg-red-600/20 border-red-500/50" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {showExplain && (
              <div className="text-xs mt-2 opacity-80">
                Explication: {q.explanation}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-md bg-accent-cyan/20"
          onClick={() => setShowExplain(true)}
        >
          Voir corrections
        </button>
        <button
          className="px-3 py-2 rounded-md border border-white/10"
          onClick={() => {
            setAnswers({});
            setShowExplain(false);
          }}
        >
          Réinitialiser
        </button>
        {score !== null && (
          <span className="text-xs opacity-80">
            Score: {score}/{block.questions.length}
          </span>
        )}
      </div>
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
      const base =
        (import.meta as any).env?.VITE_API_BASE_URL || "http://127.0.0.1:3000";
      const body = {
        missionId: block.id,
        inputType: block.expected_input_type,
        submission: value,
        language: "fr",
        mode: "builder",
        tone: "pedagogical",
        trackId: selectedPersona?.id,
        phaseId: lastStep?.metadata?.phase_id,
        journeyState: useJourneyStore.getState().userProgress,
      };
      const resp = await fetch(`${base}/api/journeys/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!resp.ok) throw new Error(`submit failed: ${resp.status}`);
      const json = await resp.json();
      // Update global lastStep so renderer can show evaluation/xp blocks
      useJourneyStore.setState({ lastStep: json });
      // Apply XP delta locally
      const xpDelta = Number(json?.next_state?.xp_delta || 0);
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
          Comprendre la mission
        </button>
        {block.nft_reward_id && (
          <span className="px-2 py-1 text-xs rounded bg-accent-purple/20">
            Proof: {block.nft_reward_id}
          </span>
        )}
      </div>
      {showHelp && (
        <div className="text-xs bg-black/30 rounded-md p-2 mb-2">
          Conseil: fournissez un livrable adapté au type{" "}
          {block.expected_input_type}. Un agent évaluera votre production et
          proposera un feedback actionnable.
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
        {submitting ? "Envoi..." : "Soumettre la mission"}
      </button>
    </div>
  );
}

function Resources({ block }: { block: ResourceBlock }) {
  const isFlashcards = (r: ResourceItem) => /flashcard/i.test(r.label);
  const copyDeck = (r: ResourceItem) => {
    const content = `# ${r.label}\n\n${r.description ?? ""}\n${r.url ?? ""}`;
    navigator.clipboard.writeText(content);
  };
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-2">{block.title}</h4>
      <div className="grid gap-2">
        {block.resources.map((r) => (
          <div
            key={r.id}
            className="border border-white/10 rounded-lg p-3 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{r.label}</div>
              {r.description && (
                <div className="text-xs opacity-80">{r.description}</div>
              )}
              <div className="text-[11px] opacity-70 mt-1">
                Proposé par {r.agent_owner} • {r.resource_type}
              </div>
            </div>
            <div className="flex gap-2">
              {r.url && (
                <a
                  className="px-3 py-1.5 rounded-md bg-accent-cyan/20"
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir
                </a>
              )}
              {isFlashcards(r) && (
                <button
                  className="px-3 py-1.5 rounded-md bg-accent-purple/20"
                  onClick={() => copyDeck(r)}
                >
                  Flashcards
                </button>
              )}
              <button
                className="px-3 py-1.5 rounded-md border border-white/10"
                onClick={() =>
                  navigator.clipboard.writeText(
                    `${r.label}\n${r.description ?? ""}\n${r.url ?? ""}`,
                  )
                }
              >
                Copier
              </button>
            </div>
          </div>
        ))}
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
        {block.axes.map((ax, i) => {
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
        language: (lastStep?.metadata?.language || "fr") as "fr" | "en",
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
      const resp = await fetch(`${base}/api/journeys/${id}/step`, {
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
        `Échec de l’action${code ? ` (HTTP ${code})` : ""}. Veuillez réessayer.`,
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
            className="fixed bottom-4 right-4 z-50 rounded-lg shadow-lg bg-red-600/90 text-white border border-white/20 p-3 w-[320px]"
          >
            <div className="text-sm font-semibold mb-1">
              Action indisponible
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
                  Retenter
                </button>
              )}
              <button
                onClick={() => setToastMsg(null)}
                className="text-xs px-2 py-1 rounded border border-white/30 hover:bg-white/10"
              >
                Fermer
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
    <div className="bg-white/5 rounded-xl p-4">
      <h4 className="font-semibold mb-1">{block.title ?? "Progression"}</h4>
      <progress
        className="w-full h-2 overflow-hidden rounded bg-white/10 [appearance:none] [&::-webkit-progress-bar]:bg-transparent [&::-webkit-progress-value]:bg-accent-cyan [&::-moz-progress-bar]:bg-accent-cyan"
        value={current}
        max={safeMax}
        aria-label="Progression XP"
      />
      <div className="text-xs mt-1 opacity-80">
        +{block.gained_xp} XP • {block.current_xp}/{block.next_level_xp}
      </div>
      {block.comment && (
        <div className="text-xs opacity-70 mt-1">{block.comment}</div>
      )}
    </div>
  );
}

export default function UIBlocksRenderer({
  response,
}: {
  response: JourneyStepResponse;
}) {
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
      default:
        return null;
    }
  };

  return (
    <section className="space-y-3">{response.ui_blocks.map(render)}</section>
  );
}
