import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../store/journeyStore';

interface ZynoChatProps {
  className?: string;
}

export default function ZynoChat({ className = '' }: ZynoChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState<Array<{ role: string, content: string, timestamp: Date }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const ensureApiJourneyId = useJourneyStore((s) => s.ensureApiJourneyId);
  const selectedPersona = useJourneyStore((s) => s.selectedPersona);
  const lastStep = useJourneyStore((s) => s.lastStep);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    // Add user message to conversation
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, userMessage]);
    setIsSending(true);
    setMessage('');

    try {
      const id = ensureApiJourneyId();
      const base = (import.meta as any).env?.VITE_API_BASE_URL || "https://journey.mfai.app/api";

      const response = await fetch(`${base}/api/journeys/${id}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInput: message,
          phaseId: lastStep?.metadata?.phase_id || 'learn',
          trackId: selectedPersona?.id || 'builder',
          language: lastStep?.metadata?.language || 'en',
          mode: lastStep?.metadata?.mode || 'discovery',
          tone: lastStep?.metadata?.tone || 'pedagogical',
          journeyState: useJourneyStore.getState().userProgress,
        })
      });

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      const data = await response.json();

      // Extract text content from UI blocks for the response
      let aiResponse = '';
      if (data.ui_blocks && Array.isArray(data.ui_blocks)) {
        for (const block of data.ui_blocks) {
          if (block.kind === 'text_block' && block.body_markdown) {
            aiResponse += block.body_markdown + '\n\n';
          } else if (block.kind === 'document_block' && block.content_markdown) {
            aiResponse += block.content_markdown + '\n\n';
          }
        }
      }

      if (!aiResponse.trim()) {
        aiResponse = "I am Zyno, your cognitive assistant. I have analyzed your question and generated a response in the interface blocks above.";
      }

      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setConversation(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Sorry, an error occurred while processing your question. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="w-80 h-[500px] flex flex-col bg-gray-900/90 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl"
        >
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-cyan-500 rounded-full mr-2 animate-pulse"></div>
              <h3 className="font-semibold">Zyno - AI Assistant</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl">🤖</span>
                </div>
                <p>Start asking Zyno a question</p>
                <p className="text-xs mt-2">Specialized AI for your {selectedPersona?.title} journey</p>
              </div>
            ) : (
              conversation.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 rounded-br-none'
                      : 'bg-gray-800/80 border border-white/10 rounded-bl-none'
                      }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    <div className={`text-xs mt-1 ${msg.role === 'user' ? 'text-cyan-200' : 'text-gray-500'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
            <div className="flex items-end space-x-2">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask Zyno a question..."
                className="flex-1 bg-gray-800/50 border border-white/10 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 max-h-40"
                rows={1}
                disabled={isSending}
              />
              <button
                type="submit"
                disabled={!message.trim() || isSending}
                className={`p-2 rounded-lg ${message.trim() && !isSending
                  ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700'
                  : 'bg-gray-700/50 cursor-not-allowed'
                  }`}
              >
                {isSending ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-600 to-purple-600 flex items-center justify-center shadow-lg hover:shadow-cyan-500/30"
        >
          <span className="text-xl">🤖</span>
        </motion.button>
      )}
    </div>
  );
}