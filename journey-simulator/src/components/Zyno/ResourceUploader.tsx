import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { FileText, FolderOpen, Loader2, RefreshCw, Shield, UploadCloud } from 'lucide-react';
import { api, RagDocument } from '../../utils/api';
import { useAgentScoreboardContext } from './AgentScoreboardContext';

interface FetchState {
  loading: boolean;
  error: string | null;
}

const initialFetchState: FetchState = {
  loading: false,
  error: null,
};

const ACCEPTED_EXTENSIONS = ['.md', '.txt', '.json', '.csv'];

const ResourceUploader = () => {
  const { apiKey, setApiKey } = useAgentScoreboardContext();
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>(initialFetchState);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const hasApiKey = useMemo(() => Boolean(apiKey?.trim()), [apiKey]);

  const loadDocuments = useCallback(async () => {
    if (!hasApiKey) {
      setDocuments([]);
      return;
    }

    setFetchState({ loading: true, error: null });
    try {
      const response = await api.listRagDocuments(apiKey!.trim());
      setDocuments(response.documents);
      setFetchState({ loading: false, error: null });
    } catch (error) {
      console.error('Unable to load RAG documents:', error);
      setFetchState({
        loading: false,
        error: error instanceof Error ? error.message : 'Impossible de récupérer la liste des documents.',
      });
    }
  }, [apiKey, hasApiKey]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUploadMessage(null);
    const file = event.target.files?.[0];
    setSelectedFile(file ?? null);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadMessage(null);

    if (!hasApiKey) {
      setUploadMessage('Fournissez une clé API admin pour lancer l\'ingestion.');
      return;
    }
    if (!selectedFile) {
      setUploadMessage('Sélectionnez un document .md, .txt, .json ou .csv.');
      return;
    }

    const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadMessage('Format non supporté. Utilisez de préférence des fichiers texte ou markdown.');
      return;
    }

    try {
      setUploading(true);
      await api.uploadRagDocument(selectedFile, apiKey!.trim());
      setUploadMessage(`✅ ${selectedFile.name} a été ingéré avec succès.`);
      setSelectedFile(null);
      await loadDocuments();
    } catch (error) {
      console.error('RAG upload failed:', error);
      setUploadMessage(error instanceof Error ? error.message : 'Ingestion impossible.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
            <UploadCloud size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Ingestion RAG locale</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ajoute des ressources pour renforcer la mémoire des agents Zyno.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={loadDocuments}
          disabled={fetchState.loading}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
        >
          <RefreshCw size={16} className={fetchState.loading ? 'animate-spin' : ''} />
          Rafraîchir
        </button>
      </header>

      <form onSubmit={handleUpload} className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Shield size={18} />
          <span>La clé API admin est partagée avec le scoreboard. Elle est requise pour l\'ingestion.</span>
        </div>
        {!hasApiKey && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Clé API admin
            <input
              type="password"
              value={apiKey ?? ''}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Saisir la clé x-api-key"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
        )}

        <label className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600 transition hover:bg-slate-100 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800">
          <FolderOpen size={22} />
          <span>
            {selectedFile ? selectedFile.name : 'Glisse ton fichier ici ou clique pour sélectionner'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Formats conseillés : markdown, texte, JSON. Taille maximale 2&nbsp;Mo.
          </span>
          <input
            type="file"
            accept={ACCEPTED_EXTENSIONS.join(',')}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        <button
          type="submit"
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400/60"
        >
          {uploading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Ingestion en cours…
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              Lancer l\'upload
            </>
          )}
        </button>

        {uploadMessage && (
          <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300">
            {uploadMessage}
          </p>
        )}
      </form>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Documents indexés ({documents.length})
        </h4>
        {fetchState.loading ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Loader2 size={16} className="animate-spin" />
            Synchronisation…
          </div>
        ) : fetchState.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            {fetchState.error}
          </p>
        ) : documents.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300">
            Aucun document indexé pour le moment.
          </p>
        ) : (
          <ul className="space-y-2">
            {documents.map((document) => (
              <li
                key={document.path}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="flex items-center gap-2 truncate">
                  <FileText size={16} className="text-indigo-500" />
                  <span className="truncate" title={document.name}>
                    {document.name}
                  </span>
                </span>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Stocké localement
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default ResourceUploader;
