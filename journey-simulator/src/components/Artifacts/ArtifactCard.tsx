/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Eye, Lock } from 'lucide-react';
import React from 'react';

interface Artifact {
  id: string;
  title: string;
  type: string;
  agent: { name: string; role: string; color: string; };
  status: string;
  thumbnailIcon: string;
}

interface Props {
  artifact: Artifact;
  onClick: () => void;
}

export const ArtifactCard: React.FC<Props> = ({ artifact, onClick }) => {
  const isLocked = artifact.status === 'locked';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={isLocked ? undefined : onClick}
      onKeyDown={isLocked ? undefined : handleKeyDown}
      role={isLocked ? undefined : 'button'}
      tabIndex={isLocked ? undefined : 0}
      className={`relative group p-4 rounded-xl border transition-all duration-300 ${isLocked
          ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-60'
          : 'bg-[#13132B]/80 border-purple-500/20 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(160,32,240,0.2)] cursor-pointer backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500/50'
        }`}
    >
      {/* Badge Type */}
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/10 ${isLocked ? 'text-gray-500' : 'text-white'}`}>
          {artifact.type}
        </span>
        {isLocked && <Lock size={14} className="text-gray-500" />}
      </div>

      {/* Title & Agent */}
      <h4 className="text-white font-bold mb-1 truncate">{artifact.title}</h4>
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
        <span className={artifact.agent.color}></span>
        <span>{artifact.agent.name}</span>
      </div>

      {/* Action Area */}
      <div className="flex items-center justify-between mt-2 pt-3 border-t border-white/5">
        <span className="text-xs text-gray-500 font-mono">v1.0.0</span>
        {!isLocked && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick();
            }}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-purple-300 transition-colors hover:bg-purple-500/10 hover:text-purple-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
            aria-label={`View ${artifact.title}`}
          >
            <Eye size={12} />
            View
          </button>
        )}
      </div>
    </div>
  );
};
