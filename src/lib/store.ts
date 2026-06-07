import { create } from 'zustand';
import { PageKey, Role, User } from './types';
import { mockUsers, mockResidents } from './mock-data';

interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => boolean;
  loginAsGuest: () => void;
  loginAsResident: (email: string, password: string) => boolean;
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

const allUsers = [...mockUsers, ...mockResidents];

export const useAppStore = create<AppState>((set) => ({
  // Auth
  currentUser: null,
  isAuthenticated: false,
  isGuest: false,

  login: (email: string, _password: string) => {
    const user = allUsers.find((u) => u.email === email);
    if (user) {
      const startPage: PageKey = user.role === 'admin' ? 'admin-dashboard' 
        : user.role === 'dispatcher' ? 'dispatcher-dashboard'
        : user.role === 'driver/responder' ? 'driver-dashboard'
        : 'resident-dashboard';
      set({
        currentUser: user,
        isAuthenticated: true,
        isGuest: false,
        currentPage: startPage,
      });
      return true;
    }
    // Allow demo login with role-based emails
    if (email === 'admin@mdrrmo.gov') {
      set({
        currentUser: mockUsers[0],
        isAuthenticated: true,
        isGuest: false,
        currentPage: 'admin-dashboard',
      });
      return true;
    }
    if (email === 'dispatcher@mdrrmo.gov') {
      set({
        currentUser: mockUsers[1],
        isAuthenticated: true,
        isGuest: false,
        currentPage: 'dispatcher-dashboard',
      });
      return true;
    }
    if (email === 'driver@mdrrmo.gov') {
      set({
        currentUser: mockUsers[12], // Roberto Guzman
        isAuthenticated: true,
        isGuest: false,
        currentPage: 'driver-dashboard',
      });
      return true;
    }
    return false;
  },

  loginAsResident: (email: string, _password: string) => {
    const resident = mockResidents.find((r) => r.email === email);
    if (resident) {
      set({
        currentUser: resident,
        isAuthenticated: true,
        isGuest: false,
        currentPage: 'resident-dashboard',
      });
      return true;
    }
    if (email === 'resident@mdrrmo.gov') {
      set({
        currentUser: mockResidents[0],
        isAuthenticated: true,
        isGuest: false,
        currentPage: 'resident-dashboard',
      });
      return true;
    }
    return false;
  },

  loginAsGuest: () => {
    set({
      currentUser: {
        id: 'GUEST',
        firstName: 'Guest',
        lastName: 'User',
        email: '',
        contactNumber: '',
        dateOfBirth: '',
        address: { houseNo: '', street: '', barangay: '', city: '', province: '' },
        idType: '',
        role: 'resident',
        status: 'active',
        registeredAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      isGuest: true,
      currentPage: 'resident-dashboard',
    });
  },

  register: (_data: Partial<User>) => {
    return true;
  },

  logout: () => {
    set({
      currentUser: null,
      isAuthenticated: false,
      isGuest: false,
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
