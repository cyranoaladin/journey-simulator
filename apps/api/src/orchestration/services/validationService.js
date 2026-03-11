/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const { validateRequest } = require('../vsliceSchema');
const workflowMap = require('../workflowMap');
const path = require('node:path');
const fs = require('node:fs');

// Load presets dynamically (same logic as in zynoVerticalSlice.js)
const loadPresets = () => {
  const dir = path.join(__dirname, '../presets');
  const map = {};
  if (!fs.existsSync(dir)) return map;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  files.forEach((file) => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (content?.name) map[content.name] = content;
    } catch (err) {
      // ignore bad preset files
    }
  });
  return map;
};

const PRESETS = loadPresets();

/**
 * Validation Service for orchestration
 * Reduces cognitive complexity by isolating all validation logic
 */
class ValidationService {
  /**
   * Validates initial payload and returns normalized request
   */
  static validatePayload(payload) {
    const validation = validateRequest(payload);
    return {
      req: validation.req,
      warnings: validation.warnings || [],
    };
  }

  /**
   * Resolves journey name from request and preset
   */
  static resolveJourneyName(req, preset) {
    if (preset?.journey) return preset.journey;
    if (req.context?.journey?.journeyType && workflowMap[req.context.journey.journeyType]) {
      return req.context.journey.journeyType;
    }
    const intents =
      Array.isArray(req.intent) ? req.intent : typeof req.intent === 'string' ? req.intent.split('+') : [];
    const normalized = intents.map((i) => (i || '').toLowerCase().replaceAll('.', '_'));
    if (normalized.some((i) => i.includes('governance') || i.includes('compliance') || i.includes('risk_fraud'))) return 'dao_readiness';
    if (normalized.some((i) => i.includes('investor'))) return 'investor_fundraise';
    if (normalized.some((i) => i.includes('product_spec') || i.includes('ux_writing'))) return 'product_launch';
    return 'generic';
  }

  /**
   * Resolves phase sequence for a given journey
   */
  static resolvePhaseSequence(journeyName) {
    const phases = workflowMap[journeyName]?.phases || {};
    return Object.keys(phases);
  }

  /**
   * Applies a preset to the request if present
   */
  static applyPreset(req, payload, ops) {
    const presetName = payload?.preset;
    const preset = presetName ? PRESETS[presetName] : null;
    if (!preset) return { req, preset: null };

    const originalIntent = payload?.intent;
    const usePresetIntents = originalIntent == null || originalIntent === 'default' || (typeof originalIntent === 'string' && originalIntent.trim() === 'default');
    const updatedReq = {
      ...req,
      intent: usePresetIntents ? (preset.intents || req.intent) : req.intent,
      input: req.input || preset.sampleInput || payload?.input,
      context: {
        ...(req.context || {}),
        journey: preset.journey || req.context?.journey,
      },
    };
    ops.warnings = ops.warnings.filter((w) => w !== 'invalid_input_schema');
    // Explicitly marks preset application for test assertions
    if (!ops.warnings.includes('preset_applied')) {
      ops.warnings.push('preset_applied');
    }
    return { req: updatedReq, preset };
  }

  /**
   * Resolves current phase from request and completed phases
   */
  static resolveCurrentPhase(req, phaseSequence, completedPhases) {
    const requestedPhase = req?.constraints?.phase || req?.context?.journey?.phaseId;
    const contextPhases = Array.isArray(req?.context?.journey?.phases) ? req.context.journey.phases : [];
    let currentPhase = requestedPhase && phaseSequence.includes(requestedPhase) ? requestedPhase : null;
    if (!currentPhase && contextPhases.length > 0) {
      currentPhase = contextPhases[contextPhases.length - 1] || null;
    }
    if (!currentPhase) {
      currentPhase = phaseSequence[completedPhases.length] || phaseSequence[0] || null;
    }
    const phaseIndex = currentPhase ? phaseSequence.indexOf(currentPhase) : 0;
    return { currentPhase, phaseIndex, phasesExecuted: contextPhases.length > 0 ? contextPhases : completedPhases };
  }

  /**
   * Updates request with resolved journey context
   */
  static enrichRequestWithJourney(req, journeyName, currentPhase, phaseSequence) {
    return {
      ...req,
      context: {
        ...(req.context || {}),
        journey: {
          ...(req.context?.journey || {}),
          journeyType: journeyName,
          phaseId: currentPhase || req.context?.journey?.phaseId,
          phases: phaseSequence,
        },
      },
    };
  }
}

module.exports = ValidationService;

