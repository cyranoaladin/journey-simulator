import React from 'react';
import type { AEPOEvaluation, RubricScores } from '@mfai/types';

interface EvaluationCardProps {
  evaluation: AEPOEvaluation;
  className?: string;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({ 
  evaluation, 
  className = '' 
}) => {
  const { score, decision, feedback, rubric, strengths, improvements } = evaluation;
  
  const isValidated = decision === 'VALIDATED';
  
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Évaluation AEPO</h3>
        <DecisionBadge decision={decision} score={score} />
      </div>
      
      {/* Score Overview */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <ScoreCircle score={score} />
          <div>
            <p className="text-sm text-gray-600">Score total</p>
            <p className="text-2xl font-bold text-gray-900">{score}/100</p>
            <p className="text-xs text-gray-500">
              Seuil: 60 points minimum
            </p>
          </div>
        </div>
      </div>
      
      {/* Rubric Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Détails par critère</h4>
        <RubricBreakdown rubric={rubric} />
      </div>
      
      {/* Feedback */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Feedback</h4>
        <p className="text-gray-600 text-sm leading-relaxed">{feedback}</p>
      </div>
      
      {/* Strengths */}
      {strengths && strengths.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-green-700 mb-2">Points forts</h4>
          <ul className="space-y-1">
            {strengths.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-green-500 mt-0.5">✓</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Improvements */}
      {improvements && improvements.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-amber-700 mb-2">Axes d'amélioration</h4>
          <ul className="space-y-1">
            {improvements.map((improvement, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-amber-500 mt-0.5">→</span>
                {improvement}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Metadata */}
      <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
        <div className="flex gap-4">
          <span>Mode: {evaluation.metrics.mode === 'llm' ? 'IA' : 'Fallback'}</span>
          {evaluation.metrics.latencyMs && (
            <span>Latence: {evaluation.metrics.latencyMs}ms</span>
          )}
          {evaluation.metrics.model && (
            <span>Modèle: {evaluation.metrics.model}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Sub-components
const DecisionBadge: React.FC<{ decision: string; score: number }> = ({ decision, score }) => {
  const isValidated = decision === 'VALIDATED';
  
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        isValidated
          ? 'bg-green-100 text-green-800'
          : 'bg-red-100 text-red-800'
      }`}
    >
      {isValidated ? '✓ Validé' : '✗ À retravailler'}
    </span>
  );
};

const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
  const getColor = () => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div className="relative w-20 h-20">
      <svg className="transform -rotate-90 w-20 h-20">
        <circle
          cx="40"
          cy="40"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200"
        />
        <circle
          cx="40"
          cy="40"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${getColor()} transition-all duration-500`}
        />
      </svg>
    </div>
  );
};

const RubricBreakdown: React.FC<{ rubric: RubricScores }> = ({ rubric }) => {
  const items = [
    { label: 'Complétude', score: rubric.completeness, max: 25, color: 'bg-blue-500' },
    { label: 'Pertinence', score: rubric.relevance, max: 25, color: 'bg-purple-500' },
    { label: 'Clarté', score: rubric.clarity, max: 20, color: 'bg-indigo-500' },
    { label: 'Spécificité', score: rubric.specificity, max: 20, color: 'bg-pink-500' },
    { label: 'Innovation', score: rubric.innovation, max: 10, color: 'bg-teal-500' },
  ];
  
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-xs text-gray-600 w-24">{item.label}</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${item.color} rounded-full transition-all duration-500`}
              style={{ width: `${(item.score / item.max) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-12 text-right">
            {item.score}/{item.max}
          </span>
        </div>
      ))}
    </div>
  );
};

export default EvaluationCard;
