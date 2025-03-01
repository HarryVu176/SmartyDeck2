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
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
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
          
          // Only persist to localStorage on client side
          if (typeof window !== 'undefined') {
            localStorage.setItem('authToken', data.token);
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    },

    async checkAuth() {
      // Only run on client side
      if (typeof window === 'undefined') return false;
      
      // If we already have a token, validate it
      if (this.token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          });
          
          if (response.ok) {
            return true;
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }

      // Clear invalid token
      this.token = null;
      this.user = null;
      return false;
    },
  },
});
