'use client';

import AdSenseBanner from '@/components/AdSenseBanner';

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Demo AdSense Banner
        </h1>

        <div className="space-y-8">
          {/* Banner formato orizzontale */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Banner Orizzontale (Responsive)
            </h2>
            <AdSenseBanner
              adSlot="1234567890"
              adFormat="auto"
              className="w-full"
            />
          </section>

          {/* Banner formato rettangolo */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Banner Rettangolo (300x250)
            </h2>
            <AdSenseBanner
              adSlot="2345678901"
              adFormat="rectangle"
              className="inline-block"
            />
          </section>

          {/* Banner formato orizzontale fisso */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Banner Orizzontale (728x90)
            </h2>
            <AdSenseBanner
              adSlot="3456789012"
              adFormat="horizontal"
              className="w-full"
            />
          </section>

          {/* Banner formato verticale */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              Banner Verticale (160x600)
            </h2>
            <AdSenseBanner
              adSlot="4567890123"
              adFormat="vertical"
              className="inline-block"
            />
          </section>
        </div>

        <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Come configurare AdSense
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
            <li>
              Accedi al tuo account Google AdSense e ottieni il tuo Publisher ID
              (es: pub-XXXXXXXXXXXXXXXX)
            </li>
            <li>
              Vai al pannello admin e inserisci il Publisher ID nel campo
              <code className="mx-1 px-2 py-1 bg-blue-100 dark:bg-blue-800 rounded">
                adSenseId
              </code>
              (solo i numeri dopo pub-)
            </li>
            <li>
              Assicurati che l'opzione <strong>Abilita Script di terze Parti</strong>{' '}
              sia attiva
            </li>
            <li>
              Accetta i cookie di marketing se richiesto dal banner dei cookie
            </li>
          </ol>

          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-6 mb-3">
            Attenzione:
          </h4>
          <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
            <li>Gli ID degli slot ad (adSlot) devono essere reali dal tuo account AdSense</li>
            <li>Senza l'ID publisher configurato, i banner non verranno mostrati</li>
            <li>I banner vengono caricati solo se il consenso cookie è attivo</li>
          </ul>
        </div>
      </div>
    </main>
  );
}