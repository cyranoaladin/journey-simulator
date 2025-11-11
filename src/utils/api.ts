// API base URL - can be overridden by Vite env (VITE_API_BASE_URL)
const API_BASE_URL =
  (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:3000";
const IS_MOCK = (import.meta as any).env?.VITE_API_MOCK === "1";

// API response interfaces
export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    wallet_address: string;
    persona?: "student" | "entrepreneur" | "developer" | "creator";
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
    subscription?: "gold" | "platinum" | "diamond" | false;
    is_active?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: "admin" | "user";
    wallet_address: string;
    persona?: "student" | "entrepreneur" | "developer" | "creator";
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
    subscription?: "gold" | "platinum" | "diamond" | false;
    is_active?: boolean;
  };
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      success: false,
      message: "Network error occurred",
    }));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }
  return response.json();
};

// API functions
export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      return await handleResponse<LoginResponse>(response);
    } catch (_) {
      if (IS_MOCK) {
        return {
          success: true,
          user: {
            id: "u_demo",
            name: "Demo User",
            email,
            role: "user",
            wallet_address: "DemoWallet",
            persona: "student",
            total_xp: 0,
            current_level: 1,
            completed_phases: 0,
            subscription: false,
            is_active: true,
          },
          accessToken: "demo_access",
          refreshToken: "demo_refresh",
          message: "mocked login",
        };
      }
      throw _;
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
  }): Promise<RegisterResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      return await handleResponse<RegisterResponse>(response);
    } catch (_) {
      if (IS_MOCK) {
        return {
          success: true,
          user: {
            id: "u_demo",
            name: userData.name || "Demo User",
            email: userData.email,
            role: "user",
            wallet_address: userData.wallet_address || "DemoWallet",
            persona: (userData.persona as any) || "student",
            total_xp: 0,
            current_level: 1,
            completed_phases: 0,
            subscription: false,
            is_active: true,
          },
          accessToken: "demo_access",
          refreshToken: "demo_refresh",
          message: "mocked register",
        };
      }
      throw _;
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/user/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }
  },

  refreshToken: async (): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ accessToken: string; refreshToken?: string }>(
      response,
    );
  },

  verifyToken: async (): Promise<{ user: LoginResponse["user"] }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleResponse<{ user: LoginResponse["user"] }>(response);
    } catch (_) {
      if (IS_MOCK) {
        const email = "demo@mfai.com";
        return {
          user: {
            id: "u_demo",
            name: "Demo User",
            email,
            role: "user",
            wallet_address: "DemoWallet",
            persona: "student",
            total_xp: 0,
            current_level: 1,
            completed_phases: 0,
            subscription: false,
            is_active: true,
          },
        };
      }
      throw _;
    }
  },

  // User profile
  getUserProfile: async (): Promise<LoginResponse["user"]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleResponse<LoginResponse["user"]>(response);
    } catch (_) {
      if (IS_MOCK) {
        return {
          id: "u_demo",
          name: "Demo User",
          email: "demo@mfai.com",
          role: "user",
          wallet_address: "DemoWallet",
          persona: "student",
          total_xp: 0,
          current_level: 1,
          completed_phases: 0,
          subscription: false,
          is_active: true,
        };
      }
      throw _;
    }
  },

  updateUserProfile: async (
    userData: Partial<LoginResponse["user"]>,
  ): Promise<LoginResponse["user"]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      return await handleResponse<LoginResponse["user"]>(response);
    } catch (_) {
      if (IS_MOCK) {
        return {
          id: "u_demo",
          name: userData.name || "Demo User",
          email:
            (userData["email" as keyof typeof userData] as any) ||
            "demo@mfai.com",
          role: "user",
          wallet_address: "DemoWallet",
          persona: (userData.persona as any) || "student",
          total_xp: 0,
          current_level: 1,
          completed_phases: 0,
          subscription: false,
          is_active: true,
        };
      }
      throw _;
    }
  },

  // Journey progress
  updateProgress: async (progressData: {
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
  }): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/journey/user-progress`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(progressData),
      });
      return await handleResponse<void>(response);
    } catch (_) {
      if (IS_MOCK) return;
      throw _;
    }
  },

  // Get user progress
  getUserProgress: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/journey/user-progress`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) {
        return {
          total_xp: 0,
          current_level: 1,
          completed_phases: 0,
          mfai_tokens: 0,
          staked_mfai: 0,
          voting_power: 0,
          nfts: [],
        };
      }
      throw _;
    }
  },

  // Complete phase
  completePhase: async (phaseData: {
    phase_number: number;
    score?: number;
    nft_address?: string;
  }): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/journey/complete-phase`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(phaseData),
      });
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) return { ok: true };
      throw _;
    }
  },

  // NFT certificates
  addNFTCertificate: async (certificateData: {
    phase: number;
    nft_address: string;
    score?: number;
  }): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/nft-certificates`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(certificateData),
      });
      return await handleResponse<void>(response);
    } catch (_) {
      if (IS_MOCK) return;
      throw _;
    }
  },

  // Token transactions
  updateTokenBalance: async (tokenData: {
    mfai_tokens: number;
  }): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/tokens`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(tokenData),
      });
      return await handleResponse<void>(response);
    } catch (_) {
      if (IS_MOCK) return;
      throw _;
    }
  },

  // Enhanced NFT certificate endpoint
  addNFTCertificateEnhanced: async (certificateData: {
    phase: number;
    title: string;
    description: string;
    image_url: string;
    mint_address: string;
    rarity: string;
    xp_earned: number;
  }): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/nft-certificates`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(certificateData),
      });
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) return { ok: true };
      throw _;
    }
  },

  // Track certification downloads
  trackCertificationDownload: async (downloadData: {
    certification_id: string;
    phase: number;
    user_persona?: string;
    download_timestamp: string;
  }): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/certification-download`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(downloadData),
        },
      );
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) return { ok: true };
      throw _;
    }
  },

  // Track certification shares
  trackCertificationShare: async (shareData: {
    certification_id: string;
    platform: string;
    phase: number;
    user_persona?: string;
    share_timestamp: string;
  }): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/certification-share`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(shareData),
        },
      );
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) return { ok: true };
      throw _;
    }
  },

  // Get access pass holders
  getAccessPassHolders: async (): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/access-pass-holders`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        },
      );
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) {
        return [
          { id: "h1", name: "Alice", level: "gold" },
          { id: "h2", name: "Bob", level: "platinum" },
        ];
      }
      throw _;
    }
  },

  // Track holder interactions
  trackHolderInteraction: async (interactionData: {
    holder_id: string;
    interaction_type: string;
    timestamp: string;
  }): Promise<any> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/analytics/holder-interaction`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(interactionData),
        },
      );
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK) return { ok: true };
      throw _;
    }
  },

  // Get platform statistics
  getPlatformStats: async (): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics/platform-stats`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      return await handleResponse<any>(response);
    } catch (_) {
      if (IS_MOCK)
        return { users: 1200, nfts: 3000, xp: 120000, activeJourneys: 80 };
      throw _;
    }
  },
};

export default api;
