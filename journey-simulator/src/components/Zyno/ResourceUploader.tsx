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
      const response = await api.listRagDocuments();
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
      setUploadMessage('Provide an admin API key to start ingestion.');
      return;
    }
    if (!selectedFile) {
      setUploadMessage('Select a .md, .txt, .json or .csv document.');
      return;
    }

    const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadMessage('Unsupported format. Please use text or markdown files.');
      return;
    }

    try {
      setUploading(true);
      // Read the file content and call uploadDocument with title, content and tags
      const fileContent = await selectedFile.text();
const fileBlob = new Blob([fileContent], { type: selectedFile?.type || 'text/plain' });
const fileBlob = new Blob([fileContent], { type: selectedFile?.type || 'text/plain' });
await api.uploadDocument(fileBlob, { title: selectedFile.name, tags: 'rag,document' }); // FIX: Pass Blob instead of object
        title: selectedFile.name,
        content: fileContent,;;
;
        tags: 'rag,document,' + selectedFile.type
      });
      setUploadMessage(`✅ ${selectedFile.name} successfully ingested.`);
      setSelectedFile(null);
      await loadDocuments();
    } catch (error) {
      console.error('RAG upload failed:', error);
      setUploadMessage(error instanceof Error ? error.message : 'Ingestion failed.');
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
            <h3 className="text-lg font-semibold">Local RAG Ingestion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Add resources to strengthen Zyno agents' memory.
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
          Refresh
        </button>
      </header>

      <form onSubmit={handleUpload} className="space-y-3 rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
        <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <Shield size={18} />
          <span>The admin API key is shared with the scoreboard. It is required for ingestion.</span>
        </div>
        {!hasApiKey && (
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Admin API Key
            <input
              type="password"
              value={apiKey ?? ''}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder="Enter x-api-key"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
        )}

        <label className="flex flex-col items-center justify-center gap-3 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-600 transition hover:bg-slate-100 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800">
          <FolderOpen size={22} />
          <span>
            {selectedFile ? selectedFile.name : 'Drag your file here or click to select'}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Recommended formats: markdown, text, JSON. Max size 2&nbsp;MB.
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
              Ingestion in progress…
            </>
          ) : (
            <>
              <UploadCloud size={16} />
              Start Upload
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
          Indexed Documents ({documents.length})
        </h4>
        {fetchState.loading ? (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <Loader2 size={16} className="animate-spin" />
            Syncing…
          </div>
        ) : fetchState.error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
            {fetchState.error}
          </p>
        ) : documents.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-300">
            No documents indexed yet.
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
                  Stored Locally
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
