import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      login: (email: string, role: UserRole) => {
        const user = mockUsers.find(u => u.email === email && u.role === role);
        if (user) {
          set({ currentUser: user, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ currentUser: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
