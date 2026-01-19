/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

export interface Artifact {
  id: string;
  title: string;
  type: string;
  agent: { name: string; role: string; color: string };
  fileUrl: string;
  unlockPhase: number;
  status: 'locked' | 'unlocked';
  thumbnailIcon: string;
}