
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3004/api';

export const useAuth = () => {
    const { publicKey, connected, signMessage } = useWallet();
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load token from storage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('mfai_token');
        if (storedToken) {
            setToken(storedToken);
            fetchUser(storedToken);
        }
    }, []);

    // Login when wallet connects
    useEffect(() => {
        if (connected && publicKey && !user && !isLoading) {
            login();
        }
    }, [connected, publicKey]);

    const fetchUser = async (authToken: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data.user);
            } else {
                // Token invalid
                logout();
            }
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    };

    const login = async () => {
        if (!publicKey) return;

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE_URL}/auth/connect-wallet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    walletAddress: publicKey.toString(),
                    chain: 'solana'
                })
            });

            const data = await res.json();

            if (res.ok) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('mfai_token', data.token);

                // Set cookie for subdomain sharing (simplified for localhost/dev)
                document.cookie = `mfai_token=${data.token}; path=/; domain=${window.location.hostname === 'localhost' ? 'localhost' : '.mfai.app'}`;
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error during login');
        } finally {
            setIsLoading(false);
        }
    };

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('mfai_token');
        document.cookie = 'mfai_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }, []);

    return {
        user,
        token,
        isLoading,
        error,
        login,
        logout,
        isAuthenticated: !!user
    };
};
