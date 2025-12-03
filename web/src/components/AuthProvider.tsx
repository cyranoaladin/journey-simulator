
'use client'
import { useAuth } from '../hooks/useAuth'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    // This hook handles the login logic automatically when wallet connects
    useAuth()

    return <>{children}</>
}
