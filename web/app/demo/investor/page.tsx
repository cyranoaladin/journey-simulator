import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function InvestorDemoPage() {
  const simulatorUrl = process.env.NEXT_PUBLIC_SIMULATOR_URL || 'http://localhost:3001'
  const demoLink = `${simulatorUrl}/journeys/capital-foundry?mode=investor_demo`

  return (
    <div className="min-h-screen bg-black text-white selection:bg-teal-500/30">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <main className="relative z-10 container mx-auto px-4 h-screen flex flex-col justify-center items-center text-center">
        <div className="mb-8 p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm animate-fade-in-up">
          <span className="text-teal-400 font-mono text-sm tracking-wider uppercase">
            Money Factory AI
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-400 animate-fade-in-up delay-100">
          Investor Demo
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 max-w-2xl mb-12 animate-fade-in-up delay-200">
          Experience the &quot;The Capital Foundry&quot; journey. Simulate an investment thesis,
          interact with AI agents, and witness the future of autonomous finance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
          <a
            href={demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative px-8 py-4 bg-teal-500 hover:bg-teal-400 text-black font-semibold rounded-full transition-all duration-300 flex items-center gap-2"
          >
            Launch Interactive Demo
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-full bg-teal-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
          </a>

          <Link
            href="/"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all duration-300 backdrop-blur-sm"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-4xl w-full animate-fade-in-up delay-400">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-teal-400 mb-2">Build a Thesis</h3>
            <p className="text-neutral-400 text-sm">
              Define your investment strategy and risk parameters with the Capital Architect agent.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-purple-400 mb-2">Analyze Data</h3>
            <p className="text-neutral-400 text-sm">
              Process real-time market signals and generate actionable insights automatically.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-orange-400 mb-2">Generate Alpha</h3>
            <p className="text-neutral-400 text-sm">
              Visualize potential returns and optimize your portfolio allocation model.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
