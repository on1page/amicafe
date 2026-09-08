'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Home, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log dell'errore per debug
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 to-white">
      {/* Header semplice */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-medium">Torna alla Home</span>
          </Link>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center">
            {/* Icona errore */}
            <div className="inline-flex items-center justify-center w-32 h-32 bg-red-100 rounded-full mb-8 animate-pulse">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>

            {/* Titolo */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Ops! Qualcosa è andato storto
            </h1>

            {/* Descrizione */}
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Ci scusiamo per l'inconveniente. Il nostro chef sta già lavorando per risolvere il problema.
              Prova a ricaricare la pagina o torna alla home.
            </p>

            {/* Dettagli errore (solo in development) */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-semibold text-red-800 mb-2">Dettagli errore (solo sviluppo):</p>
                <code className="text-xs text-red-600 break-all">{error.message}</code>
              </div>
            )}

            {/* Azioni */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                onClick={reset}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Riprova
              </Button>

              <Link href="/">
                <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg">
                  <Home className="w-5 h-5 mr-2" />
                  Torna alla Home
                </Button>
              </Link>
            </div>

            {/* Suggerimenti */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cosa puoi fare?
              </h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Ricarica la pagina (tasto F5 o icona ricarica)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Torna alla home page e naviga da lì</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Contattaci se il problema persiste</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer semplificato */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            Hai bisogno di aiuto? <Link href="/#contatti" className="text-primary hover:text-primary/80">Contattaci</Link>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Errore ID: {error.digest || 'N/A'}
          </p>
        </div>
      </footer>
    </div>
  )
}
