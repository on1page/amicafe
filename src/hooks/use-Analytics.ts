'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'event_view'
  | 'scroll'

interface AnalyticsEvent {
  eventType: AnalyticsEventType
  pageUrl?: string
  productId?: string
  duration?: number
  referrer?: string
}

export function useAnalytics() {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string>('')
  const [ipAddress, setIpAddress] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)
  const pageStartTimeRef = useRef<number>(Date.now())
  const previousUrlRef = useRef<string>('')

  // Funzione per ottenere l'indirizzo IP
  const fetchIpAddress = useCallback(async (): Promise<string> => {
    try {
      // Usa un servizio che non richiede API key
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip || 'unknown'
    } catch (error) {
      console.error('Errore nel recupero IP:', error)
      return 'unknown'
    }
  }, [])

  // Funzione per tracciare un evento
  const trackEvent = useCallback(async (event: AnalyticsEvent) => {
    if (!sessionId || !isInitialized) {
      console.warn('Analytics non inizializzato, evento non tracciato')
      return
    }

    try {
      const payload = {
        sessionId,
        eventType: event.eventType,
        pageUrl: event.pageUrl || window.location.pathname,
        productId: event.productId || null,
        duration: event.duration || null,
        referrer: event.referrer || document.referrer || '',
        userAgent: navigator.userAgent,
        ip: ipAddress
      }

      // Invia all'API di tracking
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Errore nel tracciamento evento:', error)
    }
  }, [sessionId, isInitialized, ipAddress])

  // Inizializza la sessione
  useEffect(() => {
    // Genera o recupera sessionId
    let storedSessionId = localStorage.getItem('analytics_session_id')

    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID()
      localStorage.setItem('analytics_session_id', storedSessionId)
    }

    setSessionId(storedSessionId)

    // Ottieni l'indirizzo IP
    fetchIpAddress().then(ip => {
      setIpAddress(ip)
      setIsInitialized(true)

      // Traccia la prima page view dopo aver ottenuto l'IP
      trackEvent({
        eventType: 'page_view',
        pageUrl: window.location.pathname,
        referrer: document.referrer || ''
      })
    })

    // Salva l'URL iniziale
    previousUrlRef.current = window.location.pathname

    // Salva il tempo di inizio della sessione
    pageStartTimeRef.current = Date.now()

    // Ascolta i cambiamenti di rotta
    const handleRouteChange = (url: string) => {
      const previousUrl = previousUrlRef.current

      // Calcola il tempo speso sulla pagina precedente
      const duration = Date.now() - pageStartTimeRef.current

      // Traccia l'evento page view con la durata della pagina precedente
      trackEvent({
        eventType: 'page_view',
        pageUrl: url,
        duration: duration > 0 ? duration : undefined,
        referrer: previousUrl
      })

      // Aggiorna riferimenti
      previousUrlRef.current = url
      pageStartTimeRef.current = Date.now()
    }

    // Next.js 13+ usa l'evento popstate per rilevare i cambiamenti di rotta
    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.pathname)
    })

    // Override di pushState e replaceState per intercettare la navigazione
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState

    history.pushState = function (...args) {
      originalPushState.apply(history, args)
      handleRouteChange(window.location.pathname)
    }

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args)
      handleRouteChange(window.location.pathname)
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', () => {
        handleRouteChange(window.location.pathname)
      })
      history.pushState = originalPushState
      history.replaceState = originalReplaceState

      // Traccia l'evento finale quando l'utente lascia la pagina
      const finalDuration = Date.now() - pageStartTimeRef.current
      trackEvent({
        eventType: 'page_view',
        pageUrl: previousUrlRef.current,
        duration: finalDuration > 0 ? finalDuration : undefined
      })
    }
  }, [fetchIpAddress, trackEvent])

  // Traccia una page view
  const trackPageView = useCallback((url?: string) => {
    trackEvent({
      eventType: 'page_view',
      pageUrl: url || window.location.pathname
    })
  }, [trackEvent])

  // Traccia una visualizzazione prodotto
  const trackProductView = useCallback((productId: string) => {
    trackEvent({
      eventType: 'product_view',
      productId
    })
  }, [trackEvent])

  // Traccia l'aggiunta al carrello
  const trackAddToCart = useCallback((productId: string) => {
    trackEvent({
      eventType: 'add_to_cart',
      productId
    })
  }, [trackEvent])

  // Traccia la visualizzazione di un evento
  const trackEventView = useCallback((eventId: string) => {
    trackEvent({
      eventType: 'event_view',
      pageUrl: window.location.pathname
    })
  }, [trackEvent])

  // Traccia lo scroll della pagina
  const trackScroll = useCallback(() => {
    trackEvent({
      eventType: 'scroll',
      pageUrl: window.location.pathname
    })
  }, [trackEvent])

  return {
    isInitialized,
    sessionId,
    trackEvent,
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackEventView,
    trackScroll
  }
}
