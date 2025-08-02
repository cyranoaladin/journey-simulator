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
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
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
    const response = await fetch(`${API_BASE_URL}/cours/user-progress/progress`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
    return handleResponse<void>(response);
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
};

export default api; 