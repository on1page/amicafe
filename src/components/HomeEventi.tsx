'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EventoInEvidenza {
  id: string
  titolo: string
  slug: string
  descrizioneBreve: string
  immagineUrl: string | null
  data: string
  oraInizio: string
  oraFine: string
  prezzo: number
  etichettaPrezzo: string | null
  gratuito: boolean
  graditaPrenotazione: boolean
  inEvidenza: boolean
  nuovo: boolean
}

interface HomeEventiProps {
  title?: string
  subtitle?: string
}

export default function HomeEventi({ title, subtitle }: HomeEventiProps) {
  const [eventi, setEventi] = useState<EventoInEvidenza[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEventi() {
      try {
        const response = await fetch('/api/eventi')
        if (response.ok) {
          const result = await response.json()
          const oggi = new Date()
          oggi.setHours(0, 0, 0, 0)
          const inEvidenza = (result.data || [])
            .filter((e: EventoInEvidenza) => e.inEvidenza)
            .sort((a: EventoInEvidenza, b: EventoInEvidenza) => {
              const diffA = Math.abs(new Date(a.data).getTime() - oggi.getTime())
              const diffB = Math.abs(new Date(b.data).getTime() - oggi.getTime())
              return diffA - diffB
            })
            .slice(0, 3)
          setEventi(inEvidenza)
        }
      } catch (error) {
        console.error('Errore nel recupero eventi:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventi()
  }, [])

  function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    })
  }

  if (!loading && eventi.length === 0) return null

  return (
    <section id="eventi" className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="w-4 h-4" />
            Eventi in Evidenza
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {title || 'Prossimi Eventi'}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {subtitle || 'Non perderti le nostre serate speciali e le esperienze esclusive che abbiamo preparato per te'}
          </p>
        </div>

        {/* Griglia Eventi */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl animate-pulse h-[380px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {eventi.map((evento) => (
              <Link key={evento.id} href={`/eventi`}>
                <Card className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden flex flex-col h-full cursor-pointer">
                  {/* Immagine */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {evento.immagineUrl ? (
                      <img
                        src={evento.immagineUrl}
                        alt={evento.titolo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-orange-400" />
                      </div>
                    )}

                    {/* Badge Nuovo */}
                    {evento.nuovo && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-md">
                        🔥 Nuovo
                      </span>
                    )}

                    {/* Badge Gratuito / Prenotazione */}
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      {evento.gratuito && (
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                          Gratuito
                        </span>
                      )}
                      {evento.graditaPrenotazione && !evento.gratuito && (
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md">
                          Prenotazione
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenuto */}
                  <div className="p-5 flex flex-col flex-grow">
                    {/* Data e Ora */}
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-600">{formatShortDate(evento.data)}</span>
                      <span className="text-gray-400">•</span>
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-600">{evento.oraInizio}</span>
                    </div>

                    {/* Titolo */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                      {evento.titolo}
                    </h3>

                    {/* Descrizione */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{evento.descrizioneBreve}</p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      {evento.gratuito ? (
                        <span className="text-xl font-bold text-green-600">Gratuito</span>
                      ) : (
                        <div className="flex flex-col">
                          {evento.etichettaPrezzo && (
                            <span className="text-xs text-gray-500">{evento.etichettaPrezzo}</span>
                          )}
                          <span className="text-xl font-bold text-orange-600">€{evento.prezzo}</span>
                        </div>
                      )}

                      <span className="flex items-center gap-1 text-sm font-medium text-orange-600 group-hover:gap-2 transition-all">
                        Dettagli
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Link a tutti gli eventi */}
        <div className="text-center mt-12">
          <Link href="/eventi">
            <Button variant="outline" size="lg" className="gap-2">
              Vedi tutti gli eventi
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
