import { redirect } from 'next/navigation'

export default function HomePage() {
  const target = process.env.SIMULATOR_BASE_URL || 'http://127.0.0.1:3003/'
  redirect(target)
}
