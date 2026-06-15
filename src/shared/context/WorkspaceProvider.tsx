import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { workspaces } from '../api/mockData';
import type { Workspace } from '../types';

interface WorkspaceContextValue {
  activeWorkspace: Workspace;
  workspaces: Workspace[];
  setActiveWorkspaceId: (workspaceId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(workspaces[0].id);

  const value = useMemo<WorkspaceContextValue>(() => {
    const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];
    return {
      activeWorkspace,
      workspaces,
      setActiveWorkspaceId,
    };
  }, [activeWorkspaceId]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used inside WorkspaceProvider');
  }
  return context;
}
