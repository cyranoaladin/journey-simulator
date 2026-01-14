/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

'use client'
import { useAuth } from '../hooks/useAuth'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // This hook handles the login logic automatically when wallet connects
  useAuth()

  return <>{children}</>
}
