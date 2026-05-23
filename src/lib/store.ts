import { create } from 'zustand';
import { PageKey, Role, User } from './types';
import { mockUsers } from './mock-data';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (data: Partial<User>) => boolean;
  logout: () => void;

  // Navigation
  currentPage: PageKey;
  navigateTo: (page: PageKey) => void;

  // Selected report for detail view
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: null,
  isAuthenticated: false,

  login: (email: string, _password: string) => {
    const user = mockUsers.find((u) => u.email === email);
    if (user) {
      set({
        currentUser: user,
        isAuthenticated: true,
        currentPage: user.role === 'admin' ? 'admin-dashboard' : 'dispatcher-dashboard',
      });
      return true;
    }
    // Allow demo login with role-based emails
    if (email === 'admin@mmodrm.gov') {
      set({
        currentUser: mockUsers[0],
        isAuthenticated: true,
        currentPage: 'admin-dashboard',
      });
      return true;
    }
    if (email === 'dispatcher@mmodrm.gov') {
      set({
        currentUser: mockUsers[1],
        isAuthenticated: true,
        currentPage: 'dispatcher-dashboard',
      });
      return true;
    }
    return false;
  },

  register: (_data: Partial<User>) => {
    return true;
  },

  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
      currentPage: 'login',
      selectedReportId: null,
    });
  },

  // Navigation
  currentPage: 'login',
  navigateTo: (page: PageKey) => set({ currentPage: page }),

  // Selected report
  selectedReportId: null,
  setSelectedReportId: (id: string | null) => set({ selectedReportId: id }),

  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}));
