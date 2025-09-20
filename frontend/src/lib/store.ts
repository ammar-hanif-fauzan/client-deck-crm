import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  status: number;
  contact_id: number;
  contact?: Contact;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_contacts: number;
  total_projects: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => void;
}

interface AppState {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      initialize: () => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token');
          const storedState = get();
          
          if (token && storedState.user) {
            set({ 
              token, 
              isAuthenticated: true,
              isInitialized: true 
            });
          } else {
            set({ 
              isInitialized: true 
            });
          }
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { authAPI } = await import('./api');
          const response = await authAPI.login({ email, password });
          const { user, token } = response.data;
          
          localStorage.setItem('auth_token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, password_confirmation: string) => {
        set({ isLoading: true });
        try {
          const { authAPI } = await import('./api');
          const response = await authAPI.register({ name, email, password, password_confirmation });
          const { user, token } = response.data;
          
          localStorage.setItem('auth_token', token);
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen: boolean) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
