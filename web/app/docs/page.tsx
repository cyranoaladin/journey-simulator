export default function DocsPage(){
  return (
    <main className="min-h-screen p-8 lg:p-12">
      <h1 className="text-3xl font-medium mb-2">Documentation</h1>
      <p className="opacity-80 mb-4">Documentation du MVP et des flux.</p>
      <ul className="list-disc ml-6">
        <li><a className="text-blue-300 underline" href="/rag">RAG (MVP)</a></li>
        <li><a className="text-blue-300 underline" href="/investors">Investors Dashboard</a></li>
        <li><a className="text-blue-300 underline" href="/openapi.yaml">OpenAPI (YAML)</a></li>
      </ul>
    </main>
  )
}