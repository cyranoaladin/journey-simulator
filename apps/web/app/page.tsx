/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/* (c) 2025 - Money Factory AI. Developed by Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA. All rights reserved. */
import { redirect } from 'next/navigation'

export default function HomePage() {
  const target = process.env.SIMULATOR_BASE_URL || 'http://127.0.0.1:3003/'
  redirect(target)
}
