import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LazyConfetti from './shared/LazyConfetti'

interface Props {
  score: number
  maxScore: number
  phaseId: string
  onMint: () => void
}

export default function MintCelebrationBanner({ score, maxScore, phaseId, onMint }: Props){
  const [show, setShow] = useState(true)
  const [confetti, setConfetti] = useState(true)

  useEffect(()=>{
    const t = setTimeout(()=>setConfetti(false), 2500)
    return ()=>clearTimeout(t)
  }, [])

  if(!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="relative rounded-xl border border-accent-gold/40 bg-accent-gold/10 p-4 overflow-hidden"
      >
        {confetti && (
          <div className="absolute -inset-x-4 -top-2 pointer-events-none">
            <LazyConfetti numberOfPieces={180} recycle={false} width={typeof window!=='undefined'? window.innerWidth: 800} height={160} />
          </div>
        )}
        <div className="relative flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-accent-gold">Great job on phase {phaseId}!</div>
            <div className="text-xs opacity-80">Score {score}/{maxScore} — you’ve unlocked a Proof-of-Skill™ mint.</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded bg-accent-gold text-black text-sm font-semibold" onClick={onMint}>Mint Proof-of-Skill™</button>
            <button className="px-2 py-2 text-xs opacity-70 hover:opacity-100" onClick={()=>setShow(false)}>Dismiss</button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}