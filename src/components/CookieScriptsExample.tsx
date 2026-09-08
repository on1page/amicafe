'use client'

import { useState } from 'react'
import CookieScriptLoader from './CookieScriptLoader'
import { createGoogleAnalyticsConfig, executeInitScript } from '@/lib/cookie-scripts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Code, Globe } from 'lucide-react'

/**
 * Componente di esempio per mostrare l'uso di CookieScriptLoader
 *
 * Questo componente mostra come caricare Google Analytics in modo condizionale
 * in base al consenso dell'utente per i cookie analitici.
 */
export default function CookieScriptsExample() {
  const [scriptStatus, setScriptStatus] = useState<{
    googleAnalytics: 'idle' | 'loading' | 'loaded' | 'error'
  }>({
    googleAnalytics: 'idle'
  })

  // Configurazione Google Analytics (sostituisci con il tuo ID reale)
  const gaMeasurementId = 'G-XXXXXXXXXX' // TODO: Sostituisci con il tuo ID reale
  const gaConfig = createGoogleAnalyticsConfig(gaMeasurementId)

  const handleGALoad = () => {
    setScriptStatus(prev => ({ ...prev, googleAnalytics: 'loaded' }))

    // Esegui lo script di inizializzazione
    executeInitScript(gaConfig.initScript, 'gtag-init')

    // Verifica che gtag sia disponibile
    if (typeof window !== 'undefined' && (window as any).gtag) {
      console.log('✅ Google Analytics inizializzato correttamente!')
    }
  }

  const handleGAError = (error: Error) => {
    setScriptStatus(prev => ({ ...prev, googleAnalytics: 'error' }))
    console.error('❌ Errore nel caricamento di Google Analytics:', error)
  }

  const handleConsentChange = (allowed: boolean) => {
    console.log(`🍪 Consenso per Analytics: ${allowed ? 'PERMESSO' : 'NEGATO'}`)
    if (allowed) {
      setScriptStatus(prev => ({ ...prev, googleAnalytics: 'loading' }))
    } else {
      setScriptStatus(prev => ({ ...prev, googleAnalytics: 'idle' }))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline" className="flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Caricando...</Badge>
      case 'loaded':
        return <Badge variant="default" className="bg-green-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Caricato</Badge>
      case 'error':
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Errore</Badge>
      default:
        return <Badge variant="secondary" className="flex items-center gap-1"><XCircle className="w-3 h-3" /> In attesa</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Code className="w-6 h-6" />
          Esempio: CookieScriptLoader
        </h2>
        <p className="text-gray-600">
          Come caricare script di terze parti in modo condizionale in base al consenso cookie
        </p>
      </div>

      {/* Card Google Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Google Analytics 4
            </span>
            {getStatusBadge(scriptStatus.googleAnalytics)}
          </CardTitle>
          <CardDescription>
            Carica Google Analytics solo se l'utente ha dato il consenso per i cookie analitici
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CookieScriptLoader - Il cuore del sistema */}
          <CookieScriptLoader
            cookieType="analitici"
            src={gaConfig.src}
            id={gaConfig.options.id}
            options={gaConfig.options}
            onLoad={handleGALoad}
            onError={handleGAError}
            onConsentChange={handleConsentChange}
          />

          {/* Informazioni */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">📊 Informazioni Script</h4>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div>Tipo Cookie: <span className="font-bold">analitici</span></div>
              <div>Source: <span className="text-blue-600 break-all">gtag.js</span></div>
              <div>Richiede Consenso: <span className="text-orange-600">Sì</span></div>
              <div>Caricamento: <span className="text-green-600">Condizionale</span></div>
            </div>
          </div>

          {/* Codice di esempio */}
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
            <div className="text-xs text-gray-400 mb-2">{/* Codice usato: */}</div>
            <pre className="text-xs font-mono">
{`<CookieScriptLoader
  cookieType="analitici"
  src="${gaConfig.src}"
  id="${gaConfig.options.id}"
  options={${JSON.stringify(gaConfig.options, null, 2).split('\n').map(l => '  ' + l).join('\n') }}
  onLoad={handleGALoad}
  onError={handleGAError}
  onConsentChange={handleConsentChange}
/>`}
            </pre>
          </div>

          {/* Istruzioni */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-sm">🧪 Come Testare</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Apri il <strong>Cookie Manager Debug</strong> in fondo alla pagina</li>
              <li>Assicurati che i <strong>cookie analitici siano attivi</strong> (clicca "Attiva Analitici" se necessario)</li>
              <li>Ricarica questa pagina</li>
              <li>Vedrai lo stato cambiare da "In attesa" a "Caricando..." a "✅ Caricato"</li>
              <li>Apri la console (F12) per vedere i log di caricamento</li>
              <li>Per vedere il blocco, disabilita i cookie analitici e ricarica</li>
            </ol>
          </div>

          {/* Debug Mode */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">🔧 Debug Mode</h4>
            <CookieScriptLoader
              cookieType="analitici"
              src={gaConfig.src}
              id={gaConfig.options.id + '-debug'}
              options={gaConfig.options}
              debug={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card Script Configurabili */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Altri Script Disponibili
          </CardTitle>
          <CardDescription>
            Configurazioni predefinite per altri servizi comuni
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-1">Facebook Pixel</h5>
              <p className="text-xs text-gray-600 mb-2">Tracciamento conversioni e audience</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">cookieType="marketing"</code>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-1">Hotjar</h5>
              <p className="text-xs text-gray-600 mb-2">Heatmap e session recording</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">cookieType="analitici"</code>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-1">Intercom</h5>
              <p className="text-xs text-gray-600 mb-2">Live chat e supporto clienti</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">cookieType="tecnici"</code>
            </div>
            <div className="border rounded-lg p-4">
              <h5 className="font-semibold mb-1">Google Tag Manager</h5>
              <p className="text-xs text-gray-600 mb-2">Gestione centralizzata tag</p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">cookieType="marketing"</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card Documentazione Rapida */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Documentazione Rapida</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h5 className="font-semibold mb-2">1. Importa il componente</h5>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import CookieScriptLoader from '@/components/CookieScriptLoader'
import { createGoogleAnalyticsConfig, executeInitScript } from '@/lib/cookie-scripts'`}
            </pre>
          </div>

          <div>
            <h5 className="font-semibold mb-2">2. Configura lo script</h5>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const gaConfig = createGoogleAnalyticsConfig('G-XXXXXXXXXX')

const handleLoad = () => {
  executeInitScript(gaConfig.initScript, 'gtag-init')
}`}
            </pre>
          </div>

          <div>
            <h5 className="font-semibold mb-2">3. Usa il componente</h5>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<CookieScriptLoader
  cookieType="analitici"
  src={gaConfig.src}
  id={gaConfig.options.id}
  options={gaConfig.options}
  onLoad={handleLoad}
/>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
