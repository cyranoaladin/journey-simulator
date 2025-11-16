import { FormEvent, useState } from 'react'
import { API_BASE_URL } from '../utils/api'

const PlaygroundPage = () => {
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('[Réponse ici]')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmedPrompt = prompt.trim()

    if (!trimmedPrompt) {
      setError('Merci de saisir un prompt avant de lancer le playground.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/orchestration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmedPrompt, userId: 'playground' })
      })

      if (!response.ok) {
        throw new Error(`La requête a échoué (statut ${response.status}).`)
      }

      const data = await response.json()
      setOutput(JSON.stringify(data, null, 2))
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Erreur inconnue.'
      setError(message)
      setOutput('[Réponse ici]')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">🎮 Zyno Prompt Playground</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          Expérimentez rapidement avec l&apos;orchestrateur Zyno. Les requêtes sont envoyées à l&apos;API `/orchestration` sans authentification supplémentaire.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="prompt" className="block text-sm font-medium">Prompt :</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="w-full h-40 rounded-lg border border-slate-300 bg-white/80 p-4 text-sm shadow-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 dark:border-slate-600 dark:bg-slate-900/70"
          placeholder="Décrivez votre mission..."
          aria-label="Prompt playground input"
        />

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-2 font-semibold text-white transition hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoading}
          >
            ▶ Exécuter
          </button>
          {isLoading && <span className="text-sm text-slate-500 dark:text-slate-300">Traitement en cours...</span>}
        </div>
      </form>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 dark:border-red-400/40 dark:bg-red-900/20">
          {error}
        </p>
      )}

      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Réponse LLM :</h3>
        <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/70">
          {output}
        </pre>
      </div>
    </section>
  )
}

export default PlaygroundPage
