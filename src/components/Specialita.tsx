'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Articolo {
  id: string
  nome: string
  descrizione: string | null
  prezzo: number
  prezzoPromozionale: number | null
  scadenzaPromo: string | null
  eBestChoice: boolean
  immagineUrl: string | null
  immagineAiGenerata: boolean
}

interface SpecialitaProps {
  showBestChoice?: boolean
  showPromo?: boolean
  limit?: number
  title?: string
  subtitle?: string
}

export default function Specialita({
  showBestChoice = true,
  showPromo = true,
  limit = 6,
  title = "Le Nostre Specialità",
  subtitle = "Scopri i piatti più amati dai nostri clienti e le offerte speciali del momento"
}: SpecialitaProps) {
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticoli() {
      try {
        const params = new URLSearchParams()
        if (showBestChoice) params.append('bestChoice', 'true')
        if (showPromo) params.append('inPromo', 'true')

        const response = await fetch(`/api/admin/articoli?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          setArticoli(data.slice(0, limit))
        }
      } catch (error) {
        console.error('Errore nel recupero articoli:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticoli()
  }, [showBestChoice, showPromo, limit])

  const itemsPerPage = 3
  const totalSlides = Math.ceil(articoli.length / itemsPerPage)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const isPromoValid = (scadenza: string | null) => {
    if (!scadenza) return false
    return new Date(scadenza) > new Date()
  }

  if (loading) {
    return (
      <section id="specialita" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-xl p-4">
                  <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (articoli.length === 0) {
    return null
  }

  return (
    <section id="specialita" className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
            >
              <ChevronLeft />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
            >
              <ChevronRight />
            </Button>
          </div>
        )}

        {/* Carousel */}
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * 100}%)`,
              width: `${totalSlides * 100}%`
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className="w-full flex-shrink-0 grid md:grid-cols-3 gap-6"
              >
                {articoli
                  .slice(slideIndex * itemsPerPage, (slideIndex + 1) * itemsPerPage)
                  .map((articolo) => (
                    <div
                      key={articolo.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                    >
                      {/* Image */}
                      <div className="relative h-48 md:h-56 overflow-hidden">
                        <img
                          src={articolo.immagineUrl || '/images/pasta.jpg'}
                          alt={articolo.nome}
                          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                        />
                        {articolo.eBestChoice && (
                          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Star size={14} />
                            Best Choice
                          </div>
                        )}
                        {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                          <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            -{Math.round((1 - articolo.prezzoPromozionale / articolo.prezzo) * 100)}%
                          </div>
                        )}
                        {articolo.immagineAiGenerata && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1">
                            <p className="text-[10px] text-white/80 flex items-center justify-center gap-1">
                              <Wand2 className="w-2.5 h-2.5" />
                              Immagine generata con IA
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {articolo.nome}
                        </h3>
                        {articolo.descrizione && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                            {articolo.descrizione}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) ? (
                            <>
                              <span className="text-2xl font-bold text-primary">
                                €{articolo.prezzoPromozionale.toFixed(2)}
                              </span>
                              <span className="text-lg text-gray-400 line-through">
                                €{articolo.prezzo.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-2xl font-bold text-gray-900">
                              €{articolo.prezzo.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                          <p className="text-xs text-gray-500 mt-2">
                            Promo valida fino al {new Date(articolo.scadenzaPromo!).toLocaleDateString('it-IT')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
