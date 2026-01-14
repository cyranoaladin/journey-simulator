import { useState, useCallback } from 'react';
import { useJourneyStore } from '../store/journeyStore';
import confetti from 'canvas-confetti';

// Typage strict du retour de l'Agent Zyno
export interface AgentFeedback {
    score: number; // 0 à 100
    isPassing: boolean;
    analysis: {
        strengths: string[];
        weaknesses: string[];
        nextSteps: string;
    };
}

// Les étapes "visibles" de la réflexion de l'agent (pour rassurer l'user)
const AGENT_STEPS = [
    "Initializing Zyno Neural Context...",
    "Parsing Markdown syntax & structure...",
    "Semantic analysis of 'Decentralization' concepts...",
    "Evaluating mission statement resonance...",
    "Finalizing scoring telemetry..."
];

export const useSubmitMission = () => {
    // État local de l'interaction
    const [isBusy, setIsBusy] = useState(false);
    const [currentStep, setCurrentStep] = useState<string>("");
    const [progress, setProgress] = useState(0); // 0 à 100 pour la barre de chargement
    const [feedback, setFeedback] = useState<AgentFeedback | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Import actions from store
    const { updateProgress } = useJourneyStore();

    const submitDeliverable = useCallback(async (_missionId: string, content: string) => {
        // 1. Validation Préalable
        if (!content || content.length < 50) {
            setError("Deliverable is too short. Zyno needs detailed intel.");
            return;
        }

        setIsBusy(true);
        setError(null);
        setFeedback(null);
        setProgress(0);

        try {
            // 2. Simulation de la "Réflexion" de l'Agent (UX Juiciness)
            for (let i = 0; i < AGENT_STEPS.length; i++) {
                setCurrentStep(AGENT_STEPS[i]);
                setProgress(((i + 1) / AGENT_STEPS.length) * 100);
                await new Promise(r => setTimeout(r, 800 + Math.random() * 500));
            }

            // 3. Appel API
            const result = await mockZynoEvaluation(content);
            setFeedback(result);

            // 4. Logique de Succès / Échec
            if (result.isPassing) {
                triggerSuccessEffects();
                // Update progress with XP
                await updateProgress(60); // Mission XP value
                // Note: MFAI and phase unlocking would need separate implementation
            } else {
                setError("Mission objective not met. Review Zyno's feedback and retry.");
            }

        } catch (err) {
            console.error("Zyno Connection Error:", err);
            setError("Connection to Agent Zyno lost. Please try again.");
        } finally {
            setIsBusy(false);
            setCurrentStep("");
        }
    }, [updateProgress]);

    return {
        submitDeliverable,
        isBusy,       // Pour désactiver le bouton et afficher le spinner
        currentStep,  // Pour afficher "Parsing...", "Analyzing..."
        progress,     // Pour la barre de progression de l'agent
        feedback,     // L'objet à afficher dans le panel de résultat
        error         // Pour les Toasts d'erreur
    };
};

// --- HELPER: Simulation du Cerveau de Zyno (A remplacer par ton API Call) ---
const mockZynoEvaluation = async (content: string): Promise<AgentFeedback> => {
    // Logique simple pour tester : Si le texte contient "decentralized" et "ownership", ça passe.
    const hasKeywords = /decentralized|ownership|wallet|token/i.test(content);
    const score = hasKeywords ? 85 : 45;

    return {
        score: score,
        isPassing: score >= 70,
        analysis: {
            strengths: hasKeywords
                ? ["Excellent identification of core Web3 pillars.", "Clear mapping of Legacy vs Decentralized."]
                : ["Good attempt at structure."],
            weaknesses: hasKeywords
                ? ["Could elaborate more on 'Code is Law'."]
                : ["Missed key concepts: Data Ownership and Trustless models.", "Content is too generic."],
            nextSteps: score >= 70
                ? "Proceed to 'Solana Systems Lab' to apply this theory."
                : "Re-read the Mission Brief and focus on the 'Trust' column."
        }
    };
};

// --- HELPER: Effets Visuels ---
const triggerSuccessEffects = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Confetti depuis les coins inférieurs (Cyberpunk colors)
        confetti({
            particleCount,
            spread: 60,
            origin: { x: 0, y: 1 }, // Bas gauche
            colors: ['#a855f7', '#06b6d4', '#ffffff'] // Violet, Cyan, Blanc
        });
        confetti({
            particleCount,
            spread: 60,
            origin: { x: 1, y: 1 }, // Bas droite
            colors: ['#a855f7', '#06b6d4', '#ffffff']
        });
    }, 250);
};
