'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie as CookieIcon, Shield, ExternalLink, Info, Settings, Check, Lock, BarChart3, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CompanyData {
  showCookieBanner?: boolean
  cookieBannerText?: string | null
  cookieAcceptText?: string | null
  cookieDeclineText?: string | null
  cookieTecnici?: boolean
  cookieAnalitici?: boolean
  cookieMarketing?: boolean
}

export default function CookieBanner() {
  // Verifica il consenso iniziale in modo sincrono
  const hasInitialConsent = typeof window !== 'undefined'
    ? localStorage.getItem('cookie-consent')
    : null

  const [show, setShow] = useState(!hasInitialConsent)
  const [companyData, setCompanyData] = useState<CompanyData>({})
  const [loading, setLoading] = useState(!hasInitialConsent)
  const [showCustomize, setShowCustomize] = useState(false)
  const [cookiePreferences, setCookiePreferences] = useState({
    tecnici: true,
    analitici: true,
    marketing: true
  })

  useEffect(() => {
    // Se il consenso è già stato dato, non facciamo nulla
    if (hasInitialConsent) {
      console.log('[CookieBanner] Consenso già dato:', hasInitialConsent)
      return
    }

    console.log('[CookieBanner] Nessun consenso, carico le impostazioni...')

    // Carica le impostazioni del banner cookie
    fetch('/api/admin/company-data')
      .then(res => res.json())
      .then(data => {
        console.log('[CookieBanner] Dati ricevuti:', data)
        setCompanyData(data)
        if (data.showCookieBanner !== false) {
          console.log('[CookieBanner] Mostra banner:', true)
          setShow(true)
        } else {
          console.log('[CookieBanner] Banner disabilitato nel database')
        }
      })
      .catch(err => {
        console.error('[CookieBanner] Errore nel caricamento delle impostazioni cookie:', err)
        // Se c'è un errore, mostra comunque il banner con testo di default
        setCompanyData({
          showCookieBanner: true,
          cookieBannerText: "Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su 'Autorizzo', accetti l'uso dei cookie.",
          cookieAcceptText: "Autorizzo",
          cookieDeclineText: "Annulla"
        })
        setShow(true)
      })
      .finally(() => {
        setLoading(false)
        console.log('[CookieBanner] Caricamento completato, loading:', false)
      })
  }, [hasInitialConsent])

  const handleAcceptAll = () => {
    const preferences = {
      tecnici: true,
      analitici: companyData.cookieAnalitici ?? true,
      marketing: companyData.cookieMarketing ?? true
    }
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-type', 'all')
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShow(false)
  }

  const handleAcceptNecessary = () => {
    const preferences = {
      tecnici: true,
      analitici: false,
      marketing: false
    }
    localStorage.setItem('cookie-consent', 'necessary-only')
    localStorage.setItem('cookie-consent-type', 'necessary')
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShow(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', 'custom')
    localStorage.setItem('cookie-consent-type', 'custom')
    localStorage.setItem('cookie-preferences', JSON.stringify(cookiePreferences))
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setShow(false)
  }

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    localStorage.setItem('cookie-consent-type', 'declined')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())

    // Reindirizza alla pagina precedente
    if (window.history.length > 1) {
      window.history.back()
    } else {
      // Se non c'è una pagina precedente, vai alla home
      window.location.href = '/'
    }
  }

  if (loading || !show) {
    console.log('[CookieBanner] Non renderizzato. loading:', loading, 'show:', show)
    return null
  }

  console.log('[CookieBanner] Renderizzato con successo!')

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[9999]"
      >
        {/* Overlay animato */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm"
        />

        {/* Banner Cookie */}
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 300,
            duration: 0.5
          }}
          className="fixed inset-0 flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-4xl">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Header colorato */}
              <div className="bg-gradient-to-r from-primary via-primary to-primary/80 px-6 py-4 sm:px-8 sm:py-5">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                    className="flex-shrink-0"
                  >
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                      <CookieIcon className="w-8 h-8 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">
                      🍪 Utilizziamo i Cookie
                    </h3>
                    <p className="text-primary/90 text-sm mt-1">
                      Per offrirti la migliore esperienza di navigazione
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenuto */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Icona illustrativa */}
                  <div className="hidden lg:flex flex-shrink-0 items-center justify-center">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 rounded-3xl flex items-center justify-center shadow-inner"
                    >
                      <div className="text-center">
                        <Shield className="w-16 h-16 text-primary mx-auto mb-2" />
                        <p className="text-xs font-semibold text-primary">GDPR Compliant</p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Testo e informazioni */}
                  <div className="flex-1 min-w-0">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mb-5 border border-blue-100">
                      <p className="text-gray-700 text-justify leading-relaxed text-base">
                        {companyData.cookieBannerText || "Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su 'Autorizzo', accetti l'uso dei cookie."}
                      </p>
                    </div>

                    {/* Informazioni aggiuntive */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <Shield className="w-3 h-3 text-green-600" />
                        </div>
                        <p>I tuoi dati sono trattati in conformità con il GDPR</p>
                      </div>

                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <div className="flex-shrink-0 w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <Info className="w-3 h-3 text-blue-600" />
                        </div>
                        <p>Utilizziamo solo cookie necessari e analitici anonimi</p>
                      </div>
                    </div>

                    {/* Link alle policy */}
                    <div className="flex flex-wrap gap-4 text-sm mb-6">
                      <a
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
                      >
                        Privacy Policy
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                      <span className="text-gray-300">•</span>
                      <a
                        href="/cookie-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
                      >
                        Cookie Policy
                        <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>

                    {/* Pulsanti principali */}
                    {!showCustomize ? (
                      <div className="space-y-3">
                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={handleAcceptAll}
                            className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary/30 text-base"
                          >
                            <span className="flex items-center justify-center gap-2">
                              <Check className="w-5 h-5" />
                              Accetta Tutti i Cookie
                            </span>
                          </Button>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button
                              onClick={handleAcceptNecessary}
                              variant="outline"
                              className="w-full border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 text-blue-700 font-semibold px-6 py-4 rounded-xl transition-all text-base"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <Lock className="w-5 h-5" />
                                Solo Necessari
                              </span>
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                            <Button
                              onClick={() => setShowCustomize(true)}
                              variant="outline"
                              className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-4 rounded-xl transition-all text-base"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <Settings className="w-5 h-5" />
                                Personalizza
                              </span>
                            </Button>
                          </motion.div>
                        </div>

                        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                          <Button
                            onClick={handleDecline}
                            variant="ghost"
                            className="w-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium px-6 py-2 rounded-lg transition-all text-sm"
                          >
                            Rifiuta Tutti e Esci
                          </Button>
                        </motion.div>
                      </div>
                    ) : (
                      /* Modalità Personalizza */
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                          {/* Cookie Tecnici */}
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex-shrink-0 pt-1">
                              <Lock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-gray-900">Cookie Tecnici</h4>
                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Sempre Attivi</span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">Necessari per il funzionamento del sito</p>
                            </div>
                          </div>

                          {/* Cookie Analitici */}
                          {(companyData.cookieAnalitici ?? true) && (
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex-shrink-0 pt-1">
                                <BarChart3 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-semibold text-gray-900">Cookie Analitici</h4>
                                  <button
                                    onClick={() => setCookiePreferences(prev => ({ ...prev, analitici: !prev.analitici }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cookiePreferences.analitici ? 'bg-blue-600' : 'bg-gray-300'}`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cookiePreferences.analitici ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Ci aiutano a migliorare il sito analizzando l'uso</p>
                              </div>
                            </div>
                          )}

                          {/* Cookie Marketing */}
                          {(companyData.cookieMarketing ?? true) && (
                            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex-shrink-0 pt-1">
                                <Megaphone className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <h4 className="font-semibold text-gray-900">Cookie Marketing</h4>
                                  <button
                                    onClick={() => setCookiePreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${cookiePreferences.marketing ? 'bg-purple-600' : 'bg-gray-300'}`}
                                  >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${cookiePreferences.marketing ? 'translate-x-6' : 'translate-x-1'}`} />
                                  </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Utilizzati per mostrare contenuti personalizzati</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex-1">
                            <Button
                              onClick={handleSavePreferences}
                              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-6 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl border-2 border-transparent hover:border-primary/30 text-base"
                            >
                              <span className="flex items-center justify-center gap-2">
                                <Check className="w-5 h-5" />
                                Salva Preferenze
                              </span>
                            </Button>
                          </motion.div>

                          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="flex-1">
                            <Button
                              onClick={() => setShowCustomize(false)}
                              variant="outline"
                              className="w-full border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-4 rounded-xl transition-all text-base"
                            >
                              Indietro
                            </Button>
                          </motion.div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer con info aggiuntive */}
              <div className="bg-gray-50 px-6 py-3 sm:px-8 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Accettando, acconsenti al trattamento dei dati come descritto nella nostra Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
