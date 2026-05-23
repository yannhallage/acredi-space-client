import { create } from 'zustand'

interface AuthUiState {
  sessionExpiredOpen: boolean
  openSessionExpired: () => void
  closeSessionExpired: () => void
}

export const useAuthStore = create<AuthUiState>((set) => ({
  sessionExpiredOpen: false,
  openSessionExpired: () => set({ sessionExpiredOpen: true }),
  closeSessionExpired: () => set({ sessionExpiredOpen: false }),
}))
