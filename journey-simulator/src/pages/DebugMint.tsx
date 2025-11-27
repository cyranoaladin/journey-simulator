import { useState } from 'react'
import NFTMintingModal from '../components/NFTMintingModal'

const sampleCert = {
  id: 'debug-cert',
  name: 'Debug Proof',
  description: 'Debug Proof-of-Skill NFT',
  imageUrl: 'https://placehold.co/600x400.png',
  attributes: [ { trait_type: 'XP Earned', value: '50' }, { trait_type: 'Phase', value: 'debug' } ]
} as any

export default function DebugMint(){
  const [open, setOpen] = useState(true)
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold mb-4">Debug Mint</h1>
      {open && (
        <NFTMintingModal certification={sampleCert} debugRecipient={'F11111111111111111111111111111111111111111'} onClose={()=>setOpen(false)} onMinted={()=>{}} />
      )}
      {!open && (
        <button className="btn-primary" onClick={()=>setOpen(true)}>Reopen Modal</button>
      )}
    </div>
  )
}