import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { ZynoAvatar } from '../ui/ZynoAvatar';

export interface ZynoMessage {
  id:        string;
  role:      'user' | 'assistant' | 'system';
  content:   string;
  timestamp: Date;
  type?:     'thinking' | 'observation' | 'final' | 'error';
}

interface ZynoPanelProps {
  messages:   ZynoMessage[];
  input:      string;
  onInput:    (v: string) => void;
  onSend:     () => void;
  onToggle:   () => void;
  minimized:  boolean;
  isTyping:   boolean;
}

function MessageBubble({ msg, isTyping }: { msg: ZynoMessage; isTyping: boolean }) {
  const isUser = msg.role === 'user';
  const isSystem = msg.role === 'system';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}
      className={clsx(
        'flex gap-3',
        isUser && 'flex-row-reverse'
      )}
    >
      {!isUser && (
        <ZynoAvatar 
          state={isTyping ? 'thinking' : 'idle'} 
          size="sm" 
        />
      )}
      
      <div className={clsx(
        'max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed',
        isUser 
          ? 'bg-gold-400 text-void font-medium'
          : isSystem
            ? 'bg-cyan-400/10 text-cyan-200 border border-cyan-400/20'
            : 'bg-slate-100/80 text-ink-100'
      )}>
        {msg.type === 'thinking' && !isUser && (
          <div className="flex items-center gap-2 text-cyan-300 text-2xs font-mono uppercase tracking-wider mb-2">
            <span className="animate-pulse">⚡ Processing</span>
          </div>
        )}
        <div className="whitespace-pre-wrap">{msg.content}</div>
        <div className={clsx(
          'text-2xs mt-1.5',
          isUser ? 'text-void/60' : 'text-ink-400'
        )}>
          {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

export function ZynoPanel({ 
  messages, input, onInput, onSend, onToggle, minimized, isTyping 
}: ZynoPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, minimized]);

  if (minimized) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <button
          onClick={onToggle}
          className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-100 border border-gold-400/30
                     shadow-gold-glow hover:shadow-gold-glow-lg transition-all duration-300"
        >
          <ZynoAvatar state={isTyping ? 'thinking' : 'idle'} size="sm" />
          <span className="text-sm font-medium text-ink-100">Ask Zyno</span>
          <ChevronUp size={16} className="text-ink-400 group-hover:text-gold-300 transition-colors" />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 right-6 z-40 w-[400px] max-w-[calc(100vw-48px)]"
    >
      <div className="rounded-3xl border border-gold-400/20 bg-slate-50/95 backdrop-blur-xl
                      shadow-surface overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <ZynoAvatar state={isTyping ? 'thinking' : 'speaking'} size="xs" />
            <div>
              <h3 className="text-sm font-semibold text-ink-50">Zyno AI</h3>
              <p className="text-2xs text-ink-400">
                {isTyping ? 'Thinking...' : 'Online'}
              </p>
            </div>
          </div>
          <button 
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-white/5 text-ink-400 hover:text-ink-200 transition-colors"
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Messages */}
        <div 
          ref={scrollRef}
          className="h-[320px] overflow-y-auto p-4 space-y-4 scrollbar-thin"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center px-4"
              >
                <ZynoAvatar state="idle" size="lg" />
                <h4 className="text-lg font-display font-semibold text-ink-100 mt-4">
                  Welcome to Money Factory
                </h4>
                <p className="text-sm text-ink-400 mt-2 max-w-[260px]">
                  Your AI companion for DeFi automation and wealth building
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-6">
                  {['Check my AEPO score', 'Show market opportunities', 'Analyze my portfolio'].map((s, i) => (
                    <button
                      key={i}
                      onClick={() => onInput(s)}
                      className="text-2xs px-3 py-1.5 rounded-full bg-white/5 text-ink-300 
                               hover:bg-gold-400/10 hover:text-gold-300 transition-colors border border-white/5"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              messages.map(msg => (
                <MessageBubble 
                  key={msg.id} 
                  msg={msg} 
                  isTyping={isTyping && msg === messages[messages.length - 1]}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={e => onInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onSend()}
              placeholder="Ask Zyno anything..."
              disabled={isTyping}
              className={clsx(
                'w-full pl-4 pr-12 py-3 rounded-xl text-sm',
                'bg-void border border-white/10 text-ink-100 placeholder:text-ink-500',
                'focus:outline-none focus:border-gold-400/50 focus:ring-2 focus:ring-gold-400/10',
                'transition-all duration-200',
                isTyping && 'opacity-60 cursor-not-allowed'
              )}
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isTyping}
              className={clsx(
                'absolute right-2 top-1/2 -translate-y-1/2',
                'p-2 rounded-lg transition-all duration-200',
                input.trim() && !isTyping
                  ? 'bg-gold-400 text-void hover:bg-gold-300'
                  : 'bg-white/5 text-ink-500 cursor-not-allowed'
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
