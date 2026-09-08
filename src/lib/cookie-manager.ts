/**
 * Cookie Manager - Sistema centralizzato per la gestione del consenso cookie
 *
 * Questo modulo fornisce funzioni per:
 * - Verificare lo stato del consenso dell'utente
 * - Leggere le preferenze sui cookie
 * - Caricare script di terze parti in modo condizionale
 * - Gestire gli aggiornamenti delle preferenze
 */

export type CookieType = 'tecnici' | 'analitici' | 'marketing'

export type ConsentType = 'all' | 'necessary' | 'custom' | 'declined' | null

export interface CookiePreferences {
  tecnici: boolean
  analitici: boolean
  marketing: boolean
}

export interface ConsentInfo {
  hasConsent: boolean
  consentType: ConsentType
  preferences: CookiePreferences
  consentDate: string | null
}

// Chiave localStorage per il consenso
const CONSENT_KEY = 'cookie-consent'
const CONSENT_TYPE_KEY = 'cookie-consent-type'
const PREFERENCES_KEY = 'cookie-preferences'
const CONSENT_DATE_KEY = 'cookie-consent-date'

// Cache in-memory per evitare letture ripetute dal localStorage
let _consentCache: ConsentInfo | null = null

/**
 * Verifica se siamo lato client
 */
const isClient = typeof window !== 'undefined'

/**
 * Resetta la cache interna
 * Chiamare quando si aggiorna il consenso
 */
export function clearConsentCache(): void {
  _consentCache = null
}

/**
 * Legge i dati dal localStorage
 */
function readFromLocalStorage(key: string): string | null {
  if (!isClient) return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error(`[CookieManager] Errore nella lettura di ${key}:`, error)
    return null
  }
}

/**
 * Scrive i dati nel localStorage
 */
function writeToLocalStorage(key: string, value: string): void {
  if (!isClient) return
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error(`[CookieManager] Errore nella scrittura di ${key}:`, error)
  }
}

/**
 * Ottiene le preferenze cookie predefinite
 */
function getDefaultPreferences(): CookiePreferences {
  return {
    tecnici: true,      // I cookie tecnici sono sempre attivi
    analitici: false,
    marketing: false
  }
}

/**
 * Ottiene le informazioni complete sul consenso
 */
export function getConsentInfo(): ConsentInfo {
  // Se la cache è popolata, ritorna i dati in cache
  if (_consentCache) {
    return _consentCache
  }

  const consent = readFromLocalStorage(CONSENT_KEY)
  const consentType = readFromLocalStorage(CONSENT_TYPE_KEY) as ConsentType
  const preferencesStr = readFromLocalStorage(PREFERENCES_KEY)
  const consentDate = readFromLocalStorage(CONSENT_DATE_KEY)

  let preferences: CookiePreferences = getDefaultPreferences()

  // Se ci sono preferenze salvate, le usiamo
  if (preferencesStr) {
    try {
      const savedPreferences = JSON.parse(preferencesStr) as CookiePreferences
      // Verifica che i cookie tecnici siano sempre true
      preferences = {
        ...savedPreferences,
        tecnici: true
      }
    } catch (error) {
      console.error('[CookieManager] Errore nel parsing delle preferenze:', error)
    }
  } else if (consentType === 'all') {
    // Se il consenso è "all", tutte le preferenze sono true
    preferences = {
      tecnici: true,
      analitici: true,
      marketing: true
    }
  } else if (consentType === 'necessary' || consentType === 'declined') {
    // Solo cookie tecnici
    preferences = getDefaultPreferences()
  }

  const hasConsent = consent !== null && consent !== ''

  const consentInfo: ConsentInfo = {
    hasConsent,
    consentType,
    preferences,
    consentDate
  }

  // Salva in cache
  _consentCache = consentInfo

  console.log('[CookieManager] Info consenso:', consentInfo)

  return consentInfo
}

/**
 * Verifica se l'utente ha dato il consenso
 */
export function hasConsent(): boolean {
  return getConsentInfo().hasConsent
}

/**
 * Verifica se un determinato tipo di cookie è consentito
 */
export function isCookieAllowed(cookieType: CookieType): boolean {
  const info = getConsentInfo()

  // Se non c'è consenso, non permettiamo nulla
  if (!info.hasConsent) {
    console.log(`[CookieManager] Nessun consenso, cookie ${cookieType} non permesso`)
    return false
  }

  // I cookie tecnici sono sempre permessi (anche con consenso declined, ma per sicurezza verifichiamo)
  if (cookieType === 'tecnici') {
    return true
  }

  // Per gli altri cookie, verifichiamo le preferenze
  const allowed = info.preferences[cookieType] === true
  console.log(`[CookieManager] Cookie ${cookieType}: ${allowed ? 'PERMESSO' : 'NON PERMESSO'}`)

  return allowed
}

/**
 * Aggiorna le preferenze dei cookie
 */
export function updatePreferences(preferences: Partial<CookiePreferences>): void {
  const currentInfo = getConsentInfo()

  const newPreferences: CookiePreferences = {
    ...currentInfo.preferences,
    ...preferences,
    tecnici: true // I tecnici sono sempre attivi
  }

  writeToLocalStorage(PREFERENCES_KEY, JSON.stringify(newPreferences))
  writeToLocalStorage(CONSENT_KEY, 'custom')
  writeToLocalStorage(CONSENT_TYPE_KEY, 'custom')
  writeToLocalStorage(CONSENT_DATE_KEY, new Date().toISOString())

  // Pulisci la cache per forzare il rileggimento
  clearConsentCache()

  console.log('[CookieManager] Preferenze aggiornate:', newPreferences)
}

/**
 * Carica uno script in modo condizionale
 *
 * @param type - Tipo di cookie richiesto
 * @param src - URL dello script da caricare
 * @param options - Opzioni aggiuntive per lo script
 * @returns Promise che si risolve quando lo script è caricato o rifiutato se non permesso
 */
export interface LoadScriptOptions {
  id?: string
  async?: boolean
  defer?: boolean
  crossOrigin?: string
  integrity?: string
  dataset?: Record<string, string>
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function loadScript(
  type: CookieType,
  src: string,
  options: LoadScriptOptions = {}
): Promise<HTMLScriptElement | null> {
  return new Promise((resolve, reject) => {
    console.log(`[CookieManager] Richiesto caricamento script ${type}:`, src)

    // Verifica se il cookie è permesso
    if (!isCookieAllowed(type)) {
      console.log(`[CookieManager] Script ${type} NON caricato (consenso mancante)`)
      resolve(null)
      return
    }

    // Se non siamo lato client, non possiamo caricare script
    if (!isClient) {
      console.log('[CookieManager] Non lato client, script non caricato')
      resolve(null)
      return
    }

    // Verifica se lo script è già stato caricato
    if (options.id && document.getElementById(options.id)) {
      console.log(`[CookieManager] Script ${options.id} già caricato`)
      const existingScript = document.getElementById(options.id) as HTMLScriptElement
      resolve(existingScript)
      return
    }

    try {
      // Crea l'elemento script
      const script = document.createElement('script')
      script.src = src
      script.async = options.async !== false
      script.defer = options.defer !== false

      if (options.id) script.id = options.id
      if (options.crossOrigin) script.crossOrigin = options.crossOrigin
      if (options.integrity) script.integrity = options.integrity

      // Aggiungi dataset personalizzati
      if (options.dataset) {
        Object.entries(options.dataset).forEach(([key, value]) => {
          script.dataset[key] = value
        })
      }

      // Gestisci il caricamento
      script.onload = () => {
        console.log(`[CookieManager] Script ${type} caricato con successo:`, src)
        if (options.onLoad) options.onLoad()
        resolve(script)
      }

      script.onerror = (error) => {
        console.error(`[CookieManager] Errore nel caricamento dello script ${type}:`, error)
        const err = new Error(`Failed to load script: ${src}`)
        if (options.onError) options.onError(err)
        reject(err)
      }

      // Inserisci nel DOM
      document.head.appendChild(script)
    } catch (error) {
      console.error('[CookieManager] Errore nella creazione dello script:', error)
      reject(error)
    }
  })
}

/**
 * Verifica se il consenso è stato dato da più di X giorni
 */
export function isConsentOlderThan(days: number): boolean {
  const consentDateStr = readFromLocalStorage(CONSENT_DATE_KEY)
  if (!consentDateStr) return true

  try {
    const consentDate = new Date(consentDateStr)
    const now = new Date()
    const diffDays = (now.getTime() - consentDate.getTime()) / (1000 * 60 * 60 * 24)

    return diffDays > days
  } catch (error) {
    console.error('[CookieManager] Errore nella verifica della data del consenso:', error)
    return true
  }
}

/**
 * Ottiene la data del consenso in formato leggibile
 */
export function getConsentDateFormatted(): string {
  const consentDateStr = readFromLocalStorage(CONSENT_DATE_KEY)
  if (!consentDateStr) return 'Nessun consenso'

  try {
    const consentDate = new Date(consentDateStr)
    return consentDate.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('[CookieManager] Errore nella formattazione della data:', error)
    return 'Data non disponibile'
  }
}

/**
 * Debug: Stampa lo stato completo del consenso
 */
export function debugConsentState(): void {
  const info = getConsentInfo()

  console.group('🍪 Cookie Manager - Debug State')
  console.log('Has Consent:', info.hasConsent)
  console.log('Consent Type:', info.consentType)
  console.log('Preferences:', info.preferences)
  console.log('Consent Date:', info.consentDate)
  console.log('Consent Date Formatted:', getConsentDateFormatted())
  console.log('Is Older Than 365 Days:', isConsentOlderThan(365))
  console.log('Cookie Tecnici Allowed:', isCookieAllowed('tecnici'))
  console.log('Cookie Analitici Allowed:', isCookieAllowed('analitici'))
  console.log('Cookie Marketing Allowed:', isCookieAllowed('marketing'))
  console.groupEnd()
}
