/**
 * PassLevel - Types et mappings standardisés
 * Date: 2026-03-11
 * 
 * Ce fichier définit les types PassLevel de manière cohérente
 * entre Prisma, TypeScript frontend, et API backend.
 */

// ============================================
// Enum Prisma (Source de vérité)
// ============================================
export enum PassLevel {
  STARTER = 'STARTER',           // Niveau initial
  INTERMEDIATE = 'INTERMEDIATE', // Niveau intermédiaire
  ADVANCED = 'ADVANCED',         // Niveau avancé
  ELITE = 'ELITE',               // Niveau élite
}

// ============================================
// Types legacy (pour compatibilité progressive)
// ============================================
export type LegacyPassLevel = 'Free' | 'Gold' | 'Platinum' | 'Diamond';

export type ApiPassLevel = 'STARTER' | 'INTERMEDIATE' | 'ADVANCED' | 'ELITE';

// ============================================
// Fonctions de mapping
// ============================================

/**
 * Convertit un legacy passLevel vers le nouveau format
 */
export function fromLegacyPassLevel(legacy: LegacyPassLevel | string): PassLevel {
  const mapping: Record<string, PassLevel> = {
    'Free': PassLevel.STARTER,
    'Gold': PassLevel.INTERMEDIATE,
    'Platinum': PassLevel.ADVANCED,
    'Diamond': PassLevel.ELITE,
    // Déjà au nouveau format
    'STARTER': PassLevel.STARTER,
    'INTERMEDIATE': PassLevel.INTERMEDIATE,
    'ADVANCED': PassLevel.ADVANCED,
    'ELITE': PassLevel.ELITE,
  };
  
  return mapping[legacy] || PassLevel.STARTER;
}

/**
 * Convertit un PassLevel vers le format legacy
 * (pour compatibilité avec anciens composants)
 */
export function toLegacyPassLevel(level: PassLevel): LegacyPassLevel {
  const mapping: Record<PassLevel, LegacyPassLevel> = {
    [PassLevel.STARTER]: 'Free',
    [PassLevel.INTERMEDIATE]: 'Gold',
    [PassLevel.ADVANCED]: 'Platinum',
    [PassLevel.ELITE]: 'Diamond',
  };
  
  return mapping[level];
}

/**
 * Retourne le display name humain-readable
 */
export function getPassLevelDisplayName(level: PassLevel | string): string {
  const names: Record<string, string> = {
    [PassLevel.STARTER]: 'Free Pass',
    [PassLevel.INTERMEDIATE]: 'Gold Pass',
    [PassLevel.ADVANCED]: 'Platinum Pass',
    [PassLevel.ELITE]: 'Diamond Pass',
    // Legacy support
    'Free': 'Free Pass',
    'Gold': 'Gold Pass',
    'Platinum': 'Platinum Pass',
    'Diamond': 'Diamond Pass',
  };
  
  return names[level] || 'Unknown Pass';
}

/**
 * Retourne la couleur associée au pass level
 */
export function getPassLevelColor(level: PassLevel | string): string {
  const colors: Record<string, string> = {
    [PassLevel.STARTER]: '#9CA3AF',      // gray-400
    [PassLevel.INTERMEDIATE]: '#F59E0B', // amber-500
    [PassLevel.ADVANCED]: '#3B82F6',     // blue-500
    [PassLevel.ELITE]: '#8B5CF6',        // violet-500
    // Legacy
    'Free': '#9CA3AF',
    'Gold': '#F59E0B',
    'Platinum': '#3B82F6',
    'Diamond': '#8B5CF6',
  };
  
  return colors[level] || '#9CA3AF';
}

/**
 * Détermine le pass level basé sur l'XP et les NFTs
 */
export function derivePassLevel(
  totalXP: number,
  nftCount: number
): PassLevel {
  // Logic: XP et NFTs combinés
  const score = totalXP + (nftCount * 100);
  
  if (score >= 5000) return PassLevel.ELITE;
  if (score >= 2500) return PassLevel.ADVANCED;
  if (score >= 1000) return PassLevel.INTERMEDIATE;
  return PassLevel.STARTER;
}

/**
 * Retourne les bénéfices associés à chaque niveau
 */
export function getPassLevelBenefits(level: PassLevel): string[] {
  const benefits: Record<PassLevel, string[]> = {
    [PassLevel.STARTER]: [
      'Accès aux parcours de base',
      '1 projet actif',
    ],
    [PassLevel.INTERMEDIATE]: [
      'Accès aux parcours avancés',
      '3 projets actifs',
      'Support prioritaire',
    ],
    [PassLevel.ADVANCED]: [
      'Accès complet aux parcours',
      '10 projets actifs',
      'Accès aux DAO votes',
      'Analytics avancées',
    ],
    [PassLevel.ELITE]: [
      'Accès illimité',
      'Projets illimités',
      'Accès prioritaire aux features beta',
      'Support dédié',
      'Airdrops exclusifs',
    ],
  };
  
  return benefits[level] || benefits[PassLevel.STARTER];
}

// ============================================
// Guards et validations
// ============================================

/**
 * Vérifie si une valeur est un PassLevel valide
 */
export function isValidPassLevel(value: unknown): value is PassLevel {
  return typeof value === 'string' && 
    Object.values(PassLevel).includes(value as PassLevel);
}

/**
 * Parse une valeur en PassLevel de manière sûre
 */
export function parsePassLevel(value: unknown): PassLevel {
  if (isValidPassLevel(value)) {
    return value;
  }
  
  // Try legacy conversion
  if (typeof value === 'string') {
    return fromLegacyPassLevel(value);
  }
  
  return PassLevel.STARTER;
}
