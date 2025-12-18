
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { api, LoginResponse } from "../utils/api";
import { useJourneyStore } from "../store/journeyStore";
import { loginWithWalletFlow } from "../lib/walletAuth";
import { logger } from "../utils/logger";
import { tokenStore } from "../utils/tokenStore";

// User interface matching your backend schema
type User = LoginResponse["user"];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithWallet: (wallet_address: string, signMessage?: (message: Uint8Array) => Promise<Uint8Array>) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
  }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => boolean;
  refreshToken: () => Promise<boolean>;
  loginAsDemo: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  logger.debug("AuthProvider: render");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const loadUserProgress = useJourneyStore((state) => state.loadUserProgress);
  const resetProgress = useJourneyStore((state) => state.resetProgress);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(email, password);

      // Store tokens
      tokenStore.setAccessToken(data.accessToken);
      tokenStore.setRefreshToken(data.refreshToken);

      // Set user
      setUser(data.user);
      try {
        localStorage.setItem("userId", data.user.id);
      } catch (storageError) {
        logger.warn("Unable to persist userId after login", storageError);
      }
      // Clear any lingering progress from a previous session
      await resetProgress();

      // Load user progress from backend with timeout protection
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('User progress load timeout')), 10000); // 10 second timeout
        });

        const progressPromise = loadUserProgress();

        // Race the API call with a timeout to prevent hanging
        await Promise.race([progressPromise, timeoutPromise]);
      } catch (progressError) {
        logger.error("Failed to load user progress:", progressError);
        // Continue with default progress instead of blocking the UI
      }

      return true;
    } catch (error) {
      logger.error("Login error:", error);
      return false;
    }
  }, [loadUserProgress, resetProgress]);

  const loginWithWallet = useCallback(async (wallet_address: string, signMessage?: (message: Uint8Array) => Promise<Uint8Array>): Promise<boolean> => {
    try {
      let data: LoginResponse;

      if (signMessage) {
        // Use secure flow with challenge-response
        data = await loginWithWalletFlow({ walletPublicKey: wallet_address, signMessage });
      } else {
        // Legacy flow (insecure) - disabled by default.
        const allowInsecure =
          (import.meta as any).env?.VITE_ALLOW_INSECURE_WALLET_LOGIN === 'true';
        if (!allowInsecure) {
          logger.warn('[AuthContext] Wallet login requires a signature (insecure login disabled).');
          return false;
        }

        logger.warn('[AuthContext] Using insecure wallet login (no signature provided)');
        data = await api.loginWithWallet(wallet_address);
      }

      // Store tokens
      tokenStore.setAccessToken(data.accessToken);
      tokenStore.setRefreshToken(data.refreshToken);

      // Set user
      setUser(data.user);
      try {
        localStorage.setItem("userId", data.user.id);
      } catch (storageError) {
        logger.warn("Unable to persist userId after login", storageError);
      }
      await resetProgress();
      await loadUserProgress();
      return true;
    } catch (error) {
      logger.error("Wallet login error:", error);
      return false;
    }
  }, [loadUserProgress, resetProgress]);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
  }): Promise<boolean> => {
    try {
      const data = await api.register(userData);

      // Store tokens
      tokenStore.setAccessToken(data.accessToken);
      tokenStore.setRefreshToken(data.refreshToken);

      // Set user
      setUser(data.user);
      try {
        localStorage.setItem("userId", data.user.id);
      } catch (storageError) {
        logger.warn(
          "Unable to persist userId after registration",
          storageError,
        );
      }
      await resetProgress();
      // Load user progress from backend
      await loadUserProgress();
      return true;
    } catch (error) {
      logger.error("Registration error:", error);
      return false;
    }
  }, [loadUserProgress, resetProgress]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const token = tokenStore.getRefreshToken();
      if (!token) throw new Error("No refresh token available");
      const data = await api.refreshToken();
      tokenStore.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenStore.setRefreshToken(data.refreshToken);
      }
      return true;
    } catch (error) {
      logger.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await api.logout();
    } catch (error) {
      logger.error("Logout error:", error);
    } finally {
      // Clear tokens
      tokenStore.clearTokens();
      setUser(null);
      try {
        localStorage.removeItem("userId");
      } catch (storageError) {
        logger.warn("Unable to clear userId on logout", storageError);
      }
      await resetProgress();
      navigate("/login");
    }
  }, [navigate, resetProgress]);

  const checkAuth = useCallback((): boolean => {
    const token = tokenStore.getAccessToken();
    return !!token && !!user;
  }, [user]);

  const checkAuthStatus = async () => {
    logger.debug("AuthContext: checkAuthStatus started");
    const token = tokenStore.getAccessToken();
    const refreshTokenValue = tokenStore.getRefreshToken();
    logger.debug("AuthContext: token present?", !!token, "refresh token present?", !!refreshTokenValue);

    if (token) {
      try {
        logger.debug("AuthContext: Verifying token...");
        // Verify token with backend
        const data = await api.verifyToken();
        logger.debug("AuthContext: Token verified successfully");
        setUser(data.user);
        try {
          localStorage.setItem("userId", data.user.id);
        } catch (storageError) {
          logger.warn(
            "Unable to persist userId after auth check",
            storageError,
          );
        }

        // Load user progress from backend with timeout protection
        try {
          logger.debug("AuthContext: Loading user progress...");
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('User progress load timeout')), 10000); // 10 second timeout
          });

          const progressPromise = loadUserProgress();

          // Race the API call with a timeout to prevent hanging
          await Promise.race([progressPromise, timeoutPromise]);
          logger.debug("AuthContext: User progress loaded");
        } catch (progressError) {
          logger.error("Failed to load user progress:", progressError);
          // Continue with default progress instead of blocking the UI
        }
      } catch (verifyError) {
        logger.error("Token verification failed:", verifyError);

        // Check if token was already cleared by api.ts (401 error)
        const tokenStillExists = tokenStore.getAccessToken();

        // If token was auto-cleared, don't try to refresh
        if (!tokenStillExists) {
          logger.debug("AuthContext: Token was auto-cleared, skipping refresh");
          setUser(null);
          await resetProgress();
          logger.debug("AuthContext: setting isLoading false (after auto-clear)");
          setIsLoading(false);
          return;
        }

        // Token is invalid, try to refresh only if refresh token exists
        if (refreshTokenValue) {
          try {
            logger.debug("AuthContext: Attempting token refresh...");
            const refreshResult = await refreshToken();
            if (refreshResult) {
              logger.debug("AuthContext: Token refresh successful");
              // Retry the verification after refresh
              try {
                const newToken = tokenStore.getAccessToken();
                if (!newToken) throw new Error("No access token available after refresh");
                const data = await api.verifyToken();
                setUser(data.user);

                // Load user progress
                try {
                  const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('User progress load timeout')), 10000);
                  });

                  const progressPromise = loadUserProgress();
                  await Promise.race([progressPromise, timeoutPromise]);
                } catch (progressError) {
                  logger.error("Failed to load user progress after refresh:", progressError);
                }
                logger.debug("AuthContext: setting isLoading false (after refresh success)");
                setIsLoading(false);
                return; // Successfully refreshed and verified
              } catch (retryError) {
                logger.error("Token still invalid after refresh:", retryError);
              }
            } else {
              logger.debug("AuthContext: Token refresh returned false");
            }
          } catch (refreshError) {
            logger.error("Token refresh failed:", refreshError);
          }
        }

        // If refresh failed or no refresh token, clear everything
        logger.debug("AuthContext: Clearing auth state");
        tokenStore.clearTokens();
        localStorage.removeItem("userId");
        setUser(null);
        await resetProgress();
      }
    } else {
      logger.debug("AuthContext: No token found, resetting progress");
      await resetProgress();
    }
    logger.debug("AuthContext: setting isLoading false (final)");
    setIsLoading(false);
  };

  // Check authentication status on app load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
    };

    initAuth();
  }, []);

  const value = useMemo(() => ({
    user,
    login,
    loginWithWallet,
    register,
    logout,
    isAuthenticated: !!user,
    isLoading,
    checkAuth,
    refreshToken,
    loginAsDemo: async () => {
      const demoUser = {
        id: "demo-user-id",
        email: "demo@moneyfactory.ai",
        name: "Demo User",
        role: "user" as const,
        wallet_address: "DemoWalletAddress123",
        persona: "cognitive-activation-hub" as const
      };
      setUser(demoUser);
      tokenStore.setAccessToken("demo-token");
      tokenStore.setRefreshToken("demo-refresh-token");
      localStorage.setItem("userId", demoUser.id);
      await resetProgress();
      // Mock loading progress for demo
      useJourneyStore.getState().setDemoMode(true);
      return true;
    }
  }), [user, isLoading, login, loginWithWallet, register, logout, checkAuth, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
