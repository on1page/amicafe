'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getConsentInfo,
  hasConsent,
  isCookieAllowed,
  type CookieType,
  type ConsentInfo,
  type CookiePreferences,
  clearConsentCache
} from '@/lib/cookie-manager'

/**
 * Hook per gestire il consenso dei cookie in React
 *
 * Fornisce lo stato reattivo delle preferenze cookie e metodi per verificarle
 *
 * @example
 * ```tsx
 * const { hasConsent, isAllowed, preferences, refresh } = useCookieConsent()
 *
 * if (isAllowed('analitici')) {
 *   // Carica script analitici
 * }
 * ```
 */
export function useCookieConsent() {
  // Inizializza mounted direttamente senza useEffect
  // Durante SSR window è undefined, quindi mounted = false
  // Durante il rendering client, mounted = true
  const [mounted] = useState(() => typeof window !== 'undefined')

  const [consentInfo, setConsentInfo] = useState<ConsentInfo>(() => {
    // Inizializza con dati sincroni per evitare hydration mismatch
    if (typeof window !== 'undefined') {
      return getConsentInfo()
    }
    return {
      hasConsent: false,
      consentType: null,
      preferences: {
        tecnici: true,
        analitici: false,
        marketing: false
      },
      consentDate: null
    }
  })

  /**
   * Aggiorna le informazioni sul consenso
   * Chiamare questo metodo dopo aver modificato le preferenze
   */
  const refresh = useCallback(() => {
    if (!mounted) return // Non fare nulla se non siamo lato client

    clearConsentCache()
    const info = getConsentInfo()
    setConsentInfo(info)
    console.log('[useCookieConsent] Consenso aggiornato:', info)
  }, [mounted])

  /**
   * Verifica se un tipo di cookie è consentito
   * Wrapper reattivo per isCookieAllowed
   */
  const isAllowed = useCallback((type: CookieType): boolean => {
    return isCookieAllowed(type)
  }, [])

  // Ascolta i cambiamenti nel localStorage (per supportare aggiornamenti da altre tabs)
  useEffect(() => {
    // Non registrare l'event listener se non siamo lato client
    if (!mounted) return

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === 'cookie-consent' ||
        event.key === 'cookie-consent-type' ||
        event.key === 'cookie-preferences' ||
        event.key === 'cookie-consent-date'
      ) {
        console.log('[useCookieConsent] Cambiamento localStorage rilevato:', event.key)
        refresh()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [mounted, refresh])

  return {
    // Stato del consenso
    hasConsent: consentInfo.hasConsent,
    consentType: consentInfo.consentType,
    preferences: consentInfo.preferences,
    consentDate: consentInfo.consentDate,

    // Metodi helper
    isAllowed,
    refresh,

    // Flag per evitare problemi di hydration
    mounted
  }
}

/**
 * Hook semplificato che ritorna solo le preferenze
 * Utile quando serve solo sapere cosa è permesso
 */
export function useCookiePreferences(): CookiePreferences {
  const { preferences, mounted } = useCookieConsent()

  // Durante SSR o prima del mount, ritorna valori di default sicuri
  if (!mounted) {
    return {
      tecnici: true,
      analitici: false,
      marketing: false
    }
  }

  return preferences
}

/**
 * Hook per verificare se un tipo specifico di cookie è permesso
 *
 * @example
 * ```tsx
 * const analyticsAllowed = useCookieAllowed('analitici')
 *
 * if (analyticsAllowed) {
 *   return <AnalyticsComponent />
 * }
 * ```
 */
export function useCookieAllowed(type: CookieType): boolean {
  const { isAllowed, mounted } = useCookieConsent()

  // Durante SSR o prima del mount, assumiamo false per sicurezza (tranne tecnici)
  if (!mounted) {
    return type === 'tecnici'
  }

  return isAllowed(type)
}
