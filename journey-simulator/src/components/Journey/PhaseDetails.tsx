import { CheckCircle } from 'lucide-react';
import { FC } from 'react';
import { JourneyPhase } from '../../types/journey';
import { generateStableKey } from '../../utils/generateStableKey';
import { renderHighlightedText } from '../../utils/renderHighlightedText';

interface PhaseDetailsProps {
    phase: JourneyPhase;
}

const PhaseDetails: FC<PhaseDetailsProps> = ({ phase }) => {
    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Mission Section */}
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="font-semibold text-sm mb-2 text-accent-cyan uppercase tracking-wider">Mission Objective</h4>
                <p className="text-sm leading-relaxed opacity-90">
                    {renderHighlightedText(phase.mission)}
                </p>
            </div>

            {/* Modules & Deliverables */}
            {phase.modules && phase.modules.length > 0 && (
                <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />{' '}
                        Modules & Deliverables
                    </h4>
                    <div className="grid gap-3">
                        {phase.modules.map((module) => {
                            const moduleKey = generateStableKey(module, 'module', ['title', 'id']);
                            return (
                                <div key={moduleKey} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-medium text-sm text-white/90">{module.title}</h5>
                                        <span className="text-[10px] bg-accent-gold/20 text-accent-gold px-2 py-0.5 rounded-full border border-accent-gold/20">
                                            {module.reward}
                                        </span>
                                    </div>
                                    <p className="text-xs opacity-70 mb-2">{module.description}</p>
                                    <div className="text-xs flex items-center gap-1.5 text-accent-cyan/80">
                                        <span className="font-semibold">Deliverable:</span>
                                        <span>{module.deliverable}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tools & Resources */}
                <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        Tools & Resources
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {phase.tools.map((tool) => {
                            const toolKey = generateStableKey({ name: tool }, 'tool', ['name']);
                            return (
                                <div key={toolKey} className="text-xs bg-white/5 border border-white/10 rounded-md px-2.5 py-1.5 text-white/80">
                                    {tool}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Expected Outcomes */}
                <div>
                    <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />{' '}
                        Expected Outcomes
                    </h4>
                    <div className="space-y-2">
                        {phase.outcomes.map((outcome) => {
                            const outcomeKey = generateStableKey({ text: outcome }, 'outcome', ['text']);
                            return (
                                <div key={outcomeKey} className="flex items-start gap-2 text-xs opacity-80">
                                    <CheckCircle size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                                    <span>{outcome}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Prerequisites */}
            {phase.requirements && phase.requirements.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                    <h4 className="font-semibold text-sm mb-2 opacity-70">Prerequisites</h4>
                    <ul className="text-xs space-y-1 opacity-60">
                        {phase.requirements.map((req) => {
                            const reqKey = generateStableKey({ text: req }, 'requirement', ['text']);
                            return (
                                <li key={reqKey} className="flex items-center space-x-2">
                                    <div className="w-1 h-1 bg-white rounded-full" />
                                    <span>{req}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default PhaseDetails;
