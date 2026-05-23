import type { PropsWithChildren } from 'react'
import { AuthProvider } from './AuthProvider'
import { QueryProvider } from './QueryProvider'
import { RealtimeProvider } from './RealtimeProvider'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AuthProvider>
        <RealtimeProvider>{children}</RealtimeProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
