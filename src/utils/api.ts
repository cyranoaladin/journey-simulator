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
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<LoginResponse>(response);
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    wallet_address: string;
    persona: string;
  }): Promise<RegisterResponse> => {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse<RegisterResponse>(response);
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/user/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
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

    const response = await fetch(`${API_BASE_URL}/user/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });
    return handleResponse<{ accessToken: string; refreshToken?: string }>(response);
  },

  verifyToken: async (): Promise<{ user: LoginResponse['user'] }> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ user: LoginResponse['user'] }>(response);
  },

  // User profile
  getUserProfile: async (): Promise<LoginResponse['user']> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<LoginResponse['user']>(response);
  },

  updateUserProfile: async (userData: Partial<LoginResponse['user']>): Promise<LoginResponse['user']> => {
    const response = await fetch(`${API_BASE_URL}/user/update-profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse<LoginResponse['user']>(response);
  },

  // Journey progress
  updateProgress: async (progressData: {
    total_xp?: number;
    current_level?: number;
    completed_phases?: number;
  }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/journey/user-progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
    return handleResponse<void>(response);
  },

  // Get user progress
  getUserProgress: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/journey/user-progress`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Complete phase
  completePhase: async (phaseData: {
    phase_number: number;
    score?: number;
    nft_address?: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/journey/complete-phase`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(phaseData),
    });
    return handleResponse<any>(response);
  },

  // NFT certificates
  addNFTCertificate: async (certificateData: {
    phase: number;
    nft_address: string;
    score?: number;
  }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/user/nft-certificates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certificateData),
    });
    return handleResponse<void>(response);
  },

  // Token transactions
  updateTokenBalance: async (tokenData: {
    mfai_tokens: number;
  }): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/user/tokens`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(tokenData),
    });
    return handleResponse<void>(response);
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
    const response = await fetch(`${API_BASE_URL}/user/nft-certificates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(certificateData),
    });
    return handleResponse<any>(response);
  },

  // Track certification downloads
  trackCertificationDownload: async (downloadData: {
    certification_id: string;
    phase: number;
    user_persona?: string;
    download_timestamp: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/analytics/certification-download`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(downloadData),
    });
    return handleResponse<any>(response);
  },

  // Track certification shares
  trackCertificationShare: async (shareData: {
    certification_id: string;
    platform: string;
    phase: number;
    user_persona?: string;
    share_timestamp: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/analytics/certification-share`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(shareData),
    });
    return handleResponse<any>(response);
  },

  // Get access pass holders
  getAccessPassHolders: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/analytics/access-pass-holders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },

  // Track holder interactions
  trackHolderInteraction: async (interactionData: {
    holder_id: string;
    interaction_type: string;
    timestamp: string;
  }): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/analytics/holder-interaction`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(interactionData),
    });
    return handleResponse<any>(response);
  },

  // Get platform statistics
  getPlatformStats: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/analytics/platform-stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    return handleResponse<any>(response);
  },
};

export default api; 