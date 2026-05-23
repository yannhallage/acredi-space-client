import { create } from 'zustand'

interface FileExplorerState {
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  toggleSelectedId: (id: string) => void
}

export const useFileExplorerStore = create<FileExplorerState>((set) => ({
  selectedIds: [],
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  toggleSelectedId: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((selectedId) => selectedId !== id)
        : [...state.selectedIds, id],
    })),
}))
