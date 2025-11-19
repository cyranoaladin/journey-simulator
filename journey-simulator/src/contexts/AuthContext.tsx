import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
} from "react";
import { useNavigate } from "react-router-dom";
import api, { LoginResponse } from "../utils/api";
import { useJourneyStore } from "../store/journeyStore";

// User interface matching your backend schema
type User = LoginResponse["user"];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { loadUserProgress, resetProgress } = useJourneyStore();

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        // Verify token with backend
        const data = await api.verifyToken();
        setUser(data.user);
        try {
          localStorage.setItem("userId", data.user.id);
        } catch (storageError) {
          console.warn(
            "Unable to persist userId after auth check",
            storageError,
          );
        }
        // Load user progress from backend
        await loadUserProgress();
      } catch (error) {
        console.error("Auth check failed:", error);
        // Token is invalid, try to refresh
        const refreshed = await refreshToken();
        if (!refreshed) {
          // Refresh failed, clear everything
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
          await resetProgress();
        }
      }
    } else {
      await resetProgress();
    }
    setIsLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
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
      // Load user progress from backend
      await loadUserProgress();
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (userData: {
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
  };

  const refreshToken = async (): Promise<boolean> => {
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
  };

  const logout = async () => {
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
  };

  const checkAuth = (): boolean => {
    const token = localStorage.getItem("accessToken");
    return !!token && !!user;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
