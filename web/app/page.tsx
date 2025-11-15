import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen p-8 lg:p-12">
      <section className="rounded-[28px] p-16 bg-gradient-to-br from-primary-violet/60 to-primary-cyan/40 mb-12">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h1 className="text-5xl font-semibold font-[Poppins] mb-4">Dashboard premium — Journey</h1>
            <p className="opacity-90 mb-6">Front Next.js browser-only. Sécurité: aucune API key ou API Node en client. Opérations sensibles côté serveur.</p>
            <div className="flex gap-3">
              <Link href="/wallet" className="btn btn-primary">Connexion Wallet</Link>
              <Link href="/docs" className="btn border-white/20">Documentation</Link>
            </div>
          </div>
          <div aria-hidden className="">{/* Mesh SVG simple */}
            <svg viewBox="0 0 500 320" className="w-full h-auto">
              <defs>
                <radialGradient id="mesh1" cx="20%" cy="20%" r="60%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.9"/>
                  <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.5"/>
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="mesh2" cx="80%" cy="10%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9"/>
                  <stop offset="60%" stopColor="#7c3aed" stopOpacity="0.45"/>
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                </radialGradient>
              </defs>
              <rect x="0" y="0" width="500" height="320" rx="22" fill="url(#mesh1)" opacity="0.6"/>
              <rect x="0" y="0" width="500" height="320" rx="22" fill="url(#mesh2)" opacity="0.6"/>
            </svg>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-medium mb-6">Entrer</h2>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <li className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default hover:shadow-glow transition">
            <h3 className="text-xl font-medium mb-2">Mint NFT</h3>
            <p className="opacity-75 mb-3">Flux sécurisé: préparation serveur, signature wallet.</p>
            <Link href="/mint" className="btn btn-primary">Mint</Link>
          </li>
          <li className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default hover:shadow-glow transition">
            <h3 className="text-xl font-medium mb-2">Transactions</h3>
            <p className="opacity-75 mb-3">Préparation côté serveur, signature client.</p>
            <Link href="/tx" className="btn btn-primary">Préparer</Link>
          </li>
          <li className="rounded-2xl p-6 bg-bg-mid/60 border border-white/10 shadow-default hover:shadow-glow transition">
            <h3 className="text-xl font-medium mb-2">IA & Données</h3>
            <p className="opacity-75 mb-3">Appels IA et DB côté serveur, jamais en front.</p>
            <Link href="/ai" className="btn btn-primary">Explorer</Link>
          </li>
        </ul>
      </section>
    </main>
  )
}