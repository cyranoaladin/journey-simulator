/**
 * Shared utility for persona-specific styling
 * Extracted from duplicated switch/case blocks in CertificationModal, NFTMintingModal, and ProofCertificationsBoard
 */

export interface PersonaStyle {
  bgGradient: string;
  iconBg: string;
  textColor: string;
}

const cognitiveStyle: PersonaStyle = {
  bgGradient: 'from-sky-500 to-cyan-400',
  iconBg: 'bg-sky-500',
  textColor: 'text-cyan-300'
};

export function getPersonaStyle(personaId?: string | null): PersonaStyle {
  if (!personaId) {
    return cognitiveStyle;
  }

  switch (personaId) {
    case 'cognitive-activation-hub':
      return cognitiveStyle;
    case 'capital-foundry':
      return {
        bgGradient: 'from-emerald-500 to-teal-500',
        iconBg: 'bg-emerald-500',
        textColor: 'text-emerald-300'
      };
    case 'system-architect':
      return {
        bgGradient: 'from-purple-500 to-indigo-500',
        iconBg: 'bg-purple-600',
        textColor: 'text-indigo-300'
      };
    case 'experience-studio':
      return {
        bgGradient: 'from-rose-500 to-fuchsia-500',
        iconBg: 'bg-rose-500',
        textColor: 'text-fuchsia-300'
      };
    case 'impact-engine':
      return {
        bgGradient: 'from-amber-500 to-lime-500',
        iconBg: 'bg-amber-500',
        textColor: 'text-lime-300'
      };
    case 'resilience-master':
      return {
        bgGradient: 'from-slate-500 to-cyan-600',
        iconBg: 'bg-slate-600',
        textColor: 'text-cyan-300'
      };
    default:
      return cognitiveStyle;
  }
}
