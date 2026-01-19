import * as React from 'react';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Bot, User, Cpu, CheckCircle } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    agentName?: string;
    timestamp?: Date;
    isResource?: boolean;
    resourceType?: string;
}

interface LiveCommunicationThreadProps {
    messages: Message[];
    isTyping: boolean;
    typingAgent?: string;
    className?: string;
}

const LiveCommunicationThread: React.FC<LiveCommunicationThreadProps> = ({
    messages,
    isTyping,
    typingAgent = 'Zyno Core',
    className = ''
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    return (
        <div data-testid="live-thread-container" className={`flex flex-col h-full bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-white/5">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h3 className="font-mono text-sm uppercase tracking-wider text-cyan-100">Neural Link Active</h3>
                <div className="ml-auto flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32">
                <AnimatePresence initial={false}>
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500 ${msg.role === 'user'
                                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                    : `bg-opacity-20 backdrop-blur-md border border-opacity-50 text-white shadow-lg
                                       ${(msg.agentName === 'RiskFraudAgent' || msg.agentName?.includes('Security'))
                                        ? 'bg-orange-500 border-orange-500 shadow-orange-500/40 text-orange-200'
                                        : (msg.agentName === 'Web3LegalAgent' || msg.agentName?.includes('Legal'))
                                            ? 'bg-blue-600 border-blue-500 shadow-blue-500/40 text-blue-200'
                                            : 'bg-cyan-500 border-cyan-500 shadow-cyan-500/40 text-cyan-200 animate-pulse'
                                    }`
                                    }`} data-testid={`consortium-avatar-${msg.agentName}`}>
                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                </div>

                                {/* Content Bubble */}
                                <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    {msg.role !== 'user' && (
                                        <span className="text-xs text-cyan-400 mb-1 font-mono" data-testid={`agent-name-${msg.agentName}`}>{msg.agentName || 'Zyno Agent'}</span>
                                    )}

                                    {msg.isResource ? (
                                        <ResourceBubble type={msg.resourceType || 'File'} content={msg.content} />
                                    ) : (
                                        <div
                                            data-testid={`message-bubble-${msg.role}`}
                                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-purple-600 text-white rounded-tr-none'
                                                : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 text-slate-200 rounded-tl-none shadow-lg backdrop-blur-sm shadow-cyan-900/10'
                                                }`}>
                                            {msg.content}
                                        </div>
                                    )}

                                    {msg.timestamp && (
                                        <span className="text-[10px] text-slate-500 mt-1 opacity-60">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex w-full justify-start pl-11"
                        data-testid="typing-indicator"
                    >
                        <div className="bg-slate-800/50 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                            <span className="text-xs text-cyan-400 font-mono mr-2">{typingAgent} is processing...</span>
                            <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

// Sub-component for Resource/File Handoff
const ResourceBubble = ({ type, content }: { type: string, content: string }) => {
    return (
        <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/30 rounded-xl p-3 max-w-xs cursor-pointer hover:border-emerald-400/50 transition-colors">
            <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex items-start gap-3 relative z-10">
                <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-300">
                    <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Generated Artifact</span>
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                        >
                            <CheckCircle size={10} className="text-emerald-500" />
                        </motion.div>
                    </div>
                    <p className="text-sm font-medium text-emerald-100 truncate">{content}</p>
                    <p className="text-xs text-emerald-400/60 mt-0.5 uppercase">{type}</p>
                </div>
            </div>

            {/* Scanline effect for "printing" feel */}
            <motion.div
                initial={{ top: '-100%' }}
                animate={{ top: '200%' }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 3 }}
                className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-emerald-400/10 to-transparent pointer-events-none"
            />
        </div>
    );
};

export default LiveCommunicationThread;
