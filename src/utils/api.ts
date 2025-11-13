// API base URL - update this to match your backend URL
const API_BASE_URL = 'http://localhost:3000'; // Update this to your backend URL

// API response interfaces
export interface LoginResponse {
  success: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    wallet_address: string;
    persona?: 'student' | 'entrepreneur' | 'developer' | 'creator';
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
    subscription?: 'gold' | 'platinum' | 'diamond' | false;
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
    role: 'admin' | 'user';
    wallet_address: string;
    persona?: 'student' | 'entrepreneur' | 'developer' | 'creator';
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
    subscription?: 'gold' | 'platinum' | 'diamond' | false;
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
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Centralized authenticated request with auto-refresh on 401
const request = async <T>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized: boolean = true
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  });

  if (response.status === 401 && retryOnUnauthorized) {
    // Attempt token refresh once
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        message: 'Unauthorized and no refresh token available',
      }));
      throw new Error(errorData.message || 'Unauthorized');
    }

    // Refresh token
    const refreshResp = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (refreshResp.ok) {
      const refreshData = await refreshResp.json();
      if (refreshData?.accessToken) {
        localStorage.setItem('accessToken', refreshData.accessToken);
      }
      if (refreshData?.refreshToken) {
        localStorage.setItem('refreshToken', refreshData.refreshToken);
      }

      // Retry original request once with updated Authorization header
      const retryResponse = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          ...getAuthHeaders(),
        },
      });
      return handleResponse<T>(retryResponse);
    }

    // Refresh failed
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    const errorData: ApiError = await refreshResp.json().catch(() => ({
      success: false,
      message: 'Token refresh failed',
    }));
    throw new Error(errorData.message || 'Token refresh failed');
  }

  return handleResponse<T>(response);
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      success: false,
      message: 'Network error occurred'
    }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// API functions
export const api = {
  // Authentication
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return request<LoginResponse>('/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }, false);
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
  }): Promise<RegisterResponse> => {
    return request<RegisterResponse>('/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    }, false);
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await request<void>('/user/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        }, false);
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
  },

  refreshToken: async (): Promise<{ accessToken: string; refreshToken?: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return request<{ accessToken: string; refreshToken?: string }>('/user/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }, false);
  },

  verifyToken: async (): Promise<{ user: LoginResponse['user'] }> => {
    return request<{ user: LoginResponse['user'] }>('/user/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // User profile
  getUserProfile: async (): Promise<LoginResponse['user']> => {
    return request<LoginResponse['user']>('/user/profile', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  updateUserProfile: async (userData: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> => {
    return request<LoginResponse['user']>('/user/update-profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
  },

  // Journey progress
  updateProgress: async (progressData: {
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
  }): Promise<void> => {
    return request<void>('/journey/user-progress', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
  },

  resetProgress: async (): Promise<void> => {
    return request<void>('/journey/reset-progress', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  // Get user progress
  getUserProgress: async (): Promise<any> => {
    return request<any>('/journey/user-progress', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Complete phase
  completePhase: async (phaseData: {
    phase_number: number;
    score?: number;
    nft_address?: string;
  }): Promise<any> => {
    return request<any>('/journey/complete-phase', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(phaseData),
    });
  },

  // NFT certificates
  addNFTCertificate: async (certificateData: {
    phase: number;
    nft_address: string;
    score?: number;
  }): Promise<void> => {
    return request<void>('/user/nft-certificates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certificateData),
    });
  },

  // Token transactions
  updateTokenBalance: async (tokenData: {
    mfai_tokens: number;
  }): Promise<void> => {
    return request<void>('/user/tokens', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokenData),
    });
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
    return request<any>('/user/nft-certificates', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certificateData),
    });
  },

  // Track certification downloads
  trackCertificationDownload: async (downloadData: {
    certification_id: string;
    phase: number;
    user_persona?: string;
    download_timestamp: string;
  }): Promise<any> => {
    return request<any>('/analytics/certification-download', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(downloadData),
    });
  },

  // Track certification shares
  trackCertificationShare: async (shareData: {
    certification_id: string;
    platform: string;
    phase: number;
    user_persona?: string;
    share_timestamp: string;
  }): Promise<any> => {
    return request<any>('/analytics/certification-share', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shareData),
    });
  },

  // Get access pass holders
  getAccessPassHolders: async (): Promise<any> => {
    return request<any>('/analytics/access-pass-holders', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  // Track holder interactions
  trackHolderInteraction: async (interactionData: {
    holder_id: string;
    interaction_type: string;
    timestamp: string;
  }): Promise<any> => {
    return request<any>('/analytics/holder-interaction', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(interactionData),
    });
  },

  // Get platform statistics
  getPlatformStats: async (): Promise<any> => {
    return request<any>('/analytics/platform-stats', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },
};

export default api; 