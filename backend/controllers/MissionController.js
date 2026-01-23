const EvaluationService = require('../services/EvaluationService');

class MissionController {

    /**
     * Gère la soumission d'une mission par un utilisateur
     * Route: POST /api/missions/submit
     */
    async submitMission(req, res) {
        try {
            // 1. Extraction des données reçues (Payload)
            const { missionId, submission, walletAddress } = req.body;

            console.log(`[MissionController] Nouvelle soumission pour ${missionId} par ${walletAddress}`);

            // 2. (Simulation DB) Normalement, on cherche la mission dans MongoDB ici.
            // Pour valider S2.4 sans DB complète, on crée un objet "Mock" temporaire.
            const missionContext = {
                _id: missionId,
                validationCriteria: { minLength: 15 } // Exemple: réponse de 15 caractères min
            };

            // 3. Appel du Service d'Évaluation (Le code que vous avez créé juste avant)
            const result = await EvaluationService.evaluate(missionContext, submission, { walletAddress });

            // 4. Réponse au client
            if (result.status === 'VALIDATED') {
                return res.status(200).json({ success: true, data: result });
            } else {
                return res.status(200).json({ success: false, data: result }); // 200 OK même si rejeté (logique métier)
            }

        } catch (error) {
            console.error('[MissionController] Erreur critique:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }
}

module.exports = new MissionController();
