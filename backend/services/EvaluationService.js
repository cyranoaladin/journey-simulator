const mongoose = require('mongoose');

/**
 * Service d'Évaluation des Missions (S2.4)
 * Gère la validation hybride : Déterministe (Défaut) ou IA (Zyno)
 */
class EvaluationService {
    
    constructor() {
        this.ENABLE_ZYNO = process.env.ENABLE_ZYNO_EVAL === 'true';
    }

    /**
     * Évalue une soumission utilisateur
     * @param {Object} mission - L'objet mission complet
     * @param {String} submission - La réponse textuelle de l'utilisateur
     * @param {Object} context - Contexte additionnel (phase, user history)
     * @returns {Object} { score: Number, status: String, feedback: String }
     */
    async evaluate(mission, submission, context = {}) {
        console.log(`[EvaluationService] Processing mission ${mission._id} (Mode: ${this.ENABLE_ZYNO ? 'ZYNO' : 'DETERMINISTIC'})`);

        // 1. Validation de base (Sanity Check)
        if (!submission || typeof submission !== 'string' || submission.trim().length === 0) {
            return this._formatResult(0, 'REJECTED', 'La soumission est vide.');
        }

        // 2. Aiguillage vers le bon moteur
        if (this.ENABLE_ZYNO) {
            return await this._evaluateWithZyno(mission, submission, context);
        } else {
            return this._evaluateDeterministic(mission, submission);
        }
    }

    /**
     * MODE DÉTERMINISTE (Fallback & MVP)
     * Logique simple : Si la réponse n'est pas vide et respecte une longueur min, c'est validé.
     */
    _evaluateDeterministic(mission, submission) {
        const minLength = mission.validationCriteria?.minLength || 10;
        
        if (submission.length >= minLength) {
            return this._formatResult(100, 'VALIDATED', 'Mission validée automatiquement (Critères techniques respectés).');
        } else {
            return this._formatResult(0, 'REJECTED', `Réponse trop courte (Minimum ${minLength} caractères requis).`);
        }
    }

    /**
     * MODE ZYNO (IA Agent)
     * Sera activé ultérieurement avec l'intégration OpenAI/LLM
     */
    async _evaluateWithZyno(mission, submission, context) {
        // TODO: Connecter l'agent Zyno ici
        console.warn('[EvaluationService] Zyno Agent not connected yet. Falling back to deterministic.');
        return this._evaluateDeterministic(mission, submission);
    }

    _formatResult(score, status, feedback) {
        return {
            score,
            status, // 'VALIDATED' | 'REJECTED' | 'PENDING'
            feedback,
            timestamp: new Date()
        };
    }
}

module.exports = new EvaluationService();
