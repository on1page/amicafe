import Link from 'next/link'
import { Home, UtensilsCrossed, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 to-white">
      {/* Header semplice */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Torna alla Home</span>
          </Link>
        </div>
      </header>

      {/* Contenuto principale */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Lato sinistro: Testo e CTA */}
            <div className="text-center md:text-left">
              <div className="inline-block mb-6">
                <span className="text-8xl md:text-9xl font-bold text-primary/20">404</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Ops! Piatto non trovato
              </h1>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Sembra che il piatto che stavi cercando sia finito dalla cucina o non sia mai esistito.
                Non preoccuparti, il nostro menu è ancora pieno di specialità deliziose!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg w-full sm:w-auto">
                    <Home className="w-5 h-5 mr-2" />
                    Torna alla Home
                  </Button>
                </Link>

                <Link href="/menu">
                  <Button variant="outline" className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg w-full sm:w-auto">
                    <UtensilsCrossed className="w-5 h-5 mr-2" />
                    Vedi il Menu
                  </Button>
                </Link>
              </div>
            </div>

            {/* Lato destro: Illustrazione */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-9xl mb-4">🍝</div>
                      <p className="text-primary font-medium">Cucinando qualcosa di speciale...</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Elementi decorativi */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/30 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0s' }}></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/40 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-primary/20 rounded-full opacity-50 animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Sezione aiuto aggiuntivo */}
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Cosa stavi cercando?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <Link href="/menu" className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <UtensilsCrossed className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Il Nostro Menu</h3>
                <p className="text-sm text-gray-600">Scopri tutti i nostri piatti</p>
              </Link>

              <Link href="/#chi-siamo" className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <svg className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Chi Siamo</h3>
                <p className="text-sm text-gray-600">La nostra storia e passione</p>
              </Link>

              <Link href="/#contatti" className="group p-6 border-2 border-gray-200 rounded-xl hover:border-primary hover:shadow-lg transition-all text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary transition-colors">
                  <svg className="w-8 h-8 text-primary group-hover:text-primary-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Contattaci</h3>
                <p className="text-sm text-gray-600">Prenota il tuo tavolo</p>
              </Link>
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
        </div>
      </footer>
    </div>
  )
}
