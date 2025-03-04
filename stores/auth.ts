import { defineStore } from 'pinia';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  lastChecked: number | null; // Add timestamp for last auth check
  refreshing: boolean; // Add flag to track token refresh status
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    lastChecked: null,
    refreshing: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
  },

  actions: {
    async register(email: string, username: string, password: string, inviteCode: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, username, password, inviteCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        return true;
      } catch (error: any) {
        this.error = error.message;
        return false;
      } finally {
        this.loading = false;
      }
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
          this.token = data.token;
          this.user = data.user;
          this.lastChecked = Date.now();
          
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', data.token);
            // Also store user data to avoid unnecessary API calls
            localStorage.setItem('authUser', JSON.stringify(data.user));
            localStorage.setItem('authLastChecked', String(this.lastChecked));
          }
          return true;
        }
        
        this.error = data.message || 'Login failed';
        return false;
      } catch (error) {
        this.error = 'Network error';
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.lastChecked = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        localStorage.removeItem('authLastChecked');
      }
    },

    async refreshToken() {
      // Prevent multiple simultaneous refresh attempts
      if (this.refreshing) return false;
      
      this.refreshing = true;
      
      try {
        // Call the refresh token endpoint
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Update token and user data
          this.token = data.token;
          this.user = data.user;
          this.lastChecked = Date.now();
          
          // Update localStorage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('authUser', JSON.stringify(this.user));
          localStorage.setItem('authLastChecked', String(this.lastChecked));
          
          return true;
        } else {
          // If refresh fails, we need to redirect to login
          this.logout();
          this.error = 'Your session has expired. Please log in again.';
          return false;
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
      } finally {
        this.refreshing = false;
      }
    },

    async checkAuth() {
      // Only run on client side
      if (typeof window === 'undefined') return false;
      
      // Check if we already have a token in the store
      if (!this.token) {
        // Try to get from localStorage
        const storedToken = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('authUser');
        const storedLastChecked = localStorage.getItem('authLastChecked');
        
        if (storedToken) {
          this.token = storedToken;
          
          // If we have stored user data and it's recent (less than 5 minutes old),
          // use it instead of making an API call
          if (storedUser && storedLastChecked) {
            const lastChecked = Number(storedLastChecked);
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            if (now - lastChecked < fiveMinutes) {
              this.user = JSON.parse(storedUser);
              this.lastChecked = lastChecked;
              return true;
            }
          }
        } else {
          // No token found, user is not authenticated
          return false;
        }
      }

      // If we have a token but no user data or it's been a while since we last checked,
      // validate the token with the server
      if (this.token && (!this.user || !this.lastChecked || Date.now() - this.lastChecked > 5 * 60 * 1000)) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            this.user = data.user;
            this.lastChecked = Date.now();
            
            // Update localStorage
            localStorage.setItem('authUser', JSON.stringify(this.user));
            localStorage.setItem('authLastChecked', String(this.lastChecked));
            
            return true;
          } else {
            // Token is invalid, clear auth state
            this.logout();
            return false;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          // Don't logout on network errors to prevent logout on temporary connectivity issues
          return !!this.user;
        }
      }

      // If we have both token and user data, and we checked recently, consider authenticated
      return !!this.token && !!this.user;
    },
    
    // Helper method to make authenticated API requests with token refresh
    async fetchWithAuth(url: string, options: RequestInit = {}) {
      // Ensure we have a valid token
      const isAuthenticated = await this.checkAuth();
      if (!isAuthenticated) {
        throw new Error('Not authenticated');
      }
      
      // Add authorization header
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`
      };
      
      try {
        // Make the request
        const response = await fetch(url, {
          ...options,
          headers
        });
        
        // If unauthorized, try to refresh token and retry once
        if (response.status === 401) {
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry with new token
            const retryResponse = await fetch(url, {
              ...options,
              headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.token}`
              }
            });
            
            return retryResponse;
          } else {
            // If refresh failed, throw error
            throw new Error('Session expired');
          }
        }
        
        return response;
      } catch (error) {
        console.error('API request failed:', error);
        throw error;
      }
    }
  },
});
