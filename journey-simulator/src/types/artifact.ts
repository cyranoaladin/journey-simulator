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