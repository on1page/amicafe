'use client'

import { useAnalytics } from './useAnalytics'

interface AnalyticsProviderProps {
  children: React.ReactNode
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const { isInitialized } = useAnalytics()

  // L'hook si occupa di tracciare automaticamente le page views
  // e le interazioni dell'utente

  return <>{children}</>
}
