
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

// User interface matching your backend schema
type User = LoginResponse["user"];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithWallet: (wallet_address: string) => Promise<boolean>;
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
  console.log("AuthProvider: render");
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const loadUserProgress = useJourneyStore((state) => state.loadUserProgress);
  const resetProgress = useJourneyStore((state) => state.resetProgress);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await api.login(email, password);

      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Set user
      setUser(data.user);
      try {
        localStorage.setItem("userId", data.user.id);
      } catch (storageError) {
        console.warn("Unable to persist userId after login", storageError);
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
        console.error("Failed to load user progress:", progressError);
        // Continue with default progress instead of blocking the UI
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, [loadUserProgress, resetProgress]);

  const loginWithWallet = useCallback(async (wallet_address: string): Promise<boolean> => {
    try {
      const data = await api.loginWithWallet(wallet_address);

      // Store tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Set user
      setUser(data.user);
      try {
        localStorage.setItem("userId", data.user.id);
      } catch (storageError) {
        console.warn("Unable to persist userId after login", storageError);
      }
      await resetProgress();
      await loadUserProgress();
      return true;
    } catch (error) {
      console.error("Wallet login error:", error);
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
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Set user
      setUser(data.user);
      try {
        localStorage.setItem("userId", data.user.id);
      } catch (storageError) {
        console.warn(
          "Unable to persist userId after registration",
          storageError,
        );
      }
      await resetProgress();
      // Load user progress from backend
      await loadUserProgress();
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  }, [loadUserProgress, resetProgress]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const data = await api.refreshToken();
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // Call logout endpoint to invalidate refresh token
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      try {
        localStorage.removeItem("userId");
      } catch (storageError) {
        console.warn("Unable to clear userId on logout", storageError);
      }
      await resetProgress();
      navigate("/login");
    }
  }, [navigate, resetProgress]);

  const checkAuth = useCallback((): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token && !!user;
  }, [user]);

  const checkAuthStatus = async () => {
    console.log("AuthContext: checkAuthStatus started");
    const token = localStorage.getItem("accessToken");
    const refreshTokenValue = localStorage.getItem("refreshToken");
    console.log("AuthContext: token present?", !!token, "refresh token present?", !!refreshTokenValue);

    if (token) {
      try {
        console.log("AuthContext: Verifying token...");
        // Verify token with backend
        const data = await api.verifyToken();
        console.log("AuthContext: Token verified successfully", data);
        setUser(data.user);
        try {
          localStorage.setItem("userId", data.user.id);
        } catch (storageError) {
          console.warn(
            "Unable to persist userId after auth check",
            storageError,
          );
        }

        // Load user progress from backend with timeout protection
        try {
          console.log("AuthContext: Loading user progress...");
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('User progress load timeout')), 10000); // 10 second timeout
          });

          const progressPromise = loadUserProgress();

          // Race the API call with a timeout to prevent hanging
          await Promise.race([progressPromise, timeoutPromise]);
          console.log("AuthContext: User progress loaded");
        } catch (progressError) {
          console.error("Failed to load user progress:", progressError);
          // Continue with default progress instead of blocking the UI
        }
      } catch (verifyError) {
        console.error("Token verification failed:", verifyError);
        // Token is invalid, try to refresh only if refresh token exists
        if (refreshTokenValue) {
          try {
            console.log("AuthContext: Attempting token refresh...");
            const refreshResult = await refreshToken();
            if (refreshResult) {
              console.log("AuthContext: Token refresh successful");
              // Retry the verification after refresh
              try {
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
                  console.error("Failed to load user progress after refresh:", progressError);
                }
                console.log("AuthContext: setting isLoading false (after refresh success)");
                setIsLoading(false);
                return; // Successfully refreshed and verified
              } catch (retryError) {
                console.error("Token still invalid after refresh:", retryError);
              }
            } else {
              console.log("AuthContext: Token refresh returned false");
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }

        // If refresh failed or no refresh token, clear everything
        console.log("AuthContext: Clearing auth state");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userId");
        setUser(null);
        await resetProgress();
      }
    } else {
      console.log("AuthContext: No token found, resetting progress");
      await resetProgress();
    }
    console.log("AuthContext: setting isLoading false (final)");
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
      localStorage.setItem("accessToken", "demo-token");
      localStorage.setItem("refreshToken", "demo-refresh-token");
      localStorage.setItem("userId", demoUser.id);
      await resetProgress();
      // Mock loading progress for demo
      useJourneyStore.getState().setDemoMode(true);
      return true;
    }
  }), [user, isLoading, login, loginWithWallet, register, logout, checkAuth, refreshToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
