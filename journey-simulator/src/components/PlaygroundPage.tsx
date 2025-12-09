import { FormEvent, useState, useRef, useEffect } from 'react'
import { API_BASE_URL } from '../utils/api'
import UIBlocksRenderer from './UIBlocks/UIBlocksRenderer'

interface Message {
  role: 'user' | 'assistant'
  content: any 
  timestamp: number
}

const PlaygroundPage = () => {
  const [input, setInput] = useState('')
  const [history, setHistory] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showJsonMap, setShowJsonMap] = useState<Record<number, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [history, isLoading])

  const toggleJson = (index: number) => {
    setShowJsonMap(prev => ({ ...prev, [index]: !prev[index] }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedInput = input.trim()
    if (!trimmedInput) return

    const userMsg: Message = { role: 'user', content: trimmedInput, timestamp: Date.now() }
    setHistory(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/orchestration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          input: trimmedInput, 
          userId: 'playground_session_v1' 
        })
      })

      if (!response.ok) throw new Error(`Request failed (status ${response.status}).`)
      const data = await response.json()
      const botMsg: Message = { role: 'assistant', content: data, timestamp: Date.now() }
      setHistory(prev => [...prev, botMsg])

    } catch (fetchError) {
      const errorMsg = fetchError instanceof Error ? fetchError.message : 'Unknown error.'
      setHistory(prev => [...prev, { 
        role: 'assistant', 
        content: { results: { error: { output: `Error: ${errorMsg}` } } }, 
        timestamp: Date.now() 
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-4 flex flex-col h-full">
      <header className="mb-4 flex-none">
        <h1 className="text-2xl font-bold gradient-text">🎮 Zyno Chat Playground</h1>
        <p className="text-xs text-slate-500">Continuous conversation mode.</p>
      </header>

      {/* --- FENÊTRE DE CHAT (Bordure ajoutée + Hauteur réduite) --- */}
      <div className="flex-1 flex flex-col bg-slate-900/30 border border-white/10 rounded-2xl overflow-hidden h-[calc(100vh-220px)] shadow-xl relative">
        
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          {history.length === 0 && (
            <div className="flex items-center justify-center h-full text-slate-500 italic text-sm">
              <p>Type your message below to start the simulation...</p>
            </div>
          )}

          {history.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* User Message */}
              {msg.role === 'user' && (
                <div className="bg-primary-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-md text-sm whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}

              {/* Assistant Message */}
              {msg.role === 'assistant' && (
                <div className="w-full max-w-[95%] bg-slate-900/80 border border-white/10 rounded-xl p-4 shadow-sm">
                  <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-accent-cyan uppercase tracking-wider">Zyno Agent</span>
                    <button 
                      onClick={() => toggleJson(index)}
                      className="text-[10px] px-2 py-0.5 rounded border border-white/10 hover:bg-white/5 text-slate-400 transition"
                    >
                      {showJsonMap[index] ? "{}" : "{...}"}
                    </button>
                  </div>
                  <UIBlocksRenderer response={msg.content} />
                  {showJsonMap[index] && (
                    <pre className="mt-4 text-[10px] font-mono bg-black/50 p-2 rounded text-green-400 overflow-x-auto max-h-60">
                      {JSON.stringify(msg.content, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/50 px-4 py-3 rounded-xl rounded-tl-sm flex gap-1 items-center">
                <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-accent-cyan rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* --- ZONE DE SAISIE (Intégrée en bas de la fenêtre) --- */}
        <div className="p-4 bg-slate-900/80 border-t border-white/10 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-3 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message..."
              className="flex-1 bg-black/40 border border-slate-700 rounded-xl p-3 pl-4 text-sm focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan outline-none resize-none h-[50px] scrollbar-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-semibold text-sm hover:opacity-90 transition-all shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span>Send</span>
              <span className="text-xs">🚀</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default PlaygroundPage
