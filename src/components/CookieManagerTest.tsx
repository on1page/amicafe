'use client'

import { Button } from '@/components/ui/button'
import {
  updatePreferences,
  debugConsentState,
  isConsentOlderThan,
  getConsentDateFormatted,
  type CookieType
} from '@/lib/cookie-manager'
import { useCookieConsent } from '@/hooks/useCookieConsent'

export default function CookieManagerTest() {
  // ESEMPIO: Usiamo l'hook useCookieConsent per leggere le preferenze
  const {
    hasConsent,
    consentType,
    preferences,
    consentDate,
    isAllowed,
    refresh,
    mounted
  } = useCookieConsent()

  const handleUpdatePreferences = () => {
    // Esempio: abilita solo analitici
    updatePreferences({
      tecnici: true,
      analitici: true,
      marketing: false
    })
    refresh()
  }

  const handleDisableAll = () => {
    updatePreferences({
      tecnici: true,
      analitici: false,
      marketing: false
    })
    refresh()
  }

  const cookieTypes: CookieType[] = ['tecnici', 'analitici', 'marketing']

  // Evita rendering durante SSR
  if (!mounted) {
    return (
      <div className="p-6 bg-white rounded-lg border shadow-sm max-w-4xl mx-auto my-8">
        <div className="text-center text-gray-500">Caricamento Cookie Manager...</div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm max-w-4xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">🍪 Cookie Manager Test (React Hook)</h2>

      <div className="space-y-6">
        {/* Stato del consenso - usando l'hook */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Stato del Consenso (da Hook)</h3>
          <div className="space-y-1 text-sm font-mono">
            <div>Has Consent: <span className={hasConsent ? 'text-green-600' : 'text-red-600'}>
              {hasConsent ? 'YES' : 'NO'}
            </span></div>
            <div>Consent Type: <span className="font-bold">{consentType || 'N/A'}</span></div>
            <div>Consent Date: <span>{getConsentDateFormatted()}</span></div>
            <div>Is Older Than 365 Days: <span className={isConsentOlderThan(365) ? 'text-orange-600' : 'text-green-600'}>
              {isConsentOlderThan(365) ? 'YES' : 'NO'}
            </span></div>
            <div>Mounted: <span className={mounted ? 'text-green-600' : 'text-gray-400'}>
              {mounted ? 'YES' : 'NO'}
            </span></div>
          </div>
        </div>

        {/* Preferenze - usando l'hook */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Preferenze Cookie (da Hook)</h3>
          <div className="grid grid-cols-3 gap-4">
            {cookieTypes.map(type => (
              <div key={type} className="text-center">
                <div className="font-medium capitalize">{type}</div>
                <div className={`text-2xl font-bold ${isAllowed(type) ? 'text-green-600' : 'text-red-600'}`}>
                  {isAllowed(type) ? '✓' : '✗'}
                </div>
                <div className="text-xs text-gray-600">
                  {preferences[type] ? 'Abilitato' : 'Disabilitato'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Azioni di test */}
        <div className="p-4 bg-orange-50 rounded-lg">
          <h3 className="font-semibold mb-3">Azioni di Test</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={refresh} variant="outline" size="sm">
              Aggiorna Info (refresh)
            </Button>
            <Button onClick={handleUpdatePreferences} variant="outline" size="sm">
              Attiva Analitici
            </Button>
            <Button onClick={handleDisableAll} variant="outline" size="sm">
              Disabilita Tutto (tranne tecnici)
            </Button>
            <Button onClick={debugConsentState} variant="outline" size="sm">
              Debug in Console (F12)
            </Button>
          </div>
        </div>

        {/* Istruzioni aggiornate */}
        <div className="p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Come Usare l'Hook</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <p><strong>Esempio base:</strong></p>
            <pre className="bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto text-xs">
{`const { hasConsent, isAllowed, preferences } = useCookieConsent()

if (hasConsent && isAllowed('analitici')) {
  // Carica script analitici
}`}
            </pre>
            <p><strong>Test istantaneo:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Modifica il consenso nel CookieBanner o qui sotto</li>
              <li>Lo stato si aggiorna automaticamente grazie all'hook</li>
              <li>Apri la console (F12) e clicca "Debug in Console" per i dettagli</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
