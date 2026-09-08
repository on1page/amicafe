'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, AlertTriangle, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Footer from '@/components/Footer'
import SocialSidebar from '@/components/SocialSidebar'
import { useAnalytics } from '../../components/useAnalytics'
import { useSearchParams } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

interface Allergene {
  id: string
  nome: string
  descrizione: string | null
  icona: string | null
}

interface Articolo {
  id: string
  nome: string
  descrizione: string | null
  categoriaId: string
  categoria: {
    id: string
    nome: string
    ordine: number
  }
  prezzo: number
  prezzoPromozionale: number | null
  scadenzaPromo: string | null
  eSurgelato: boolean
  eBestChoice: boolean
  attivo: boolean
  allergeni: Allergene[]
  immagineUrl: string | null
  immagineAiGenerata: boolean
}

interface Categoria {
  id: string
  nome: string
  ordine: number
}

function MenuContent() {
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAllergene, setSelectedAllergene] = useState<{ articoloId: string; allergeneId: string } | null>(null)
  const { trackProductView, isInitialized } = useAnalytics()
  const trackedProducts = useRef<Set<string>>(new Set())
  const searchParams = useSearchParams()

  useEffect(() => {
    async function fetchData() {
      try {
        const [artRes, catRes] = await Promise.all([
          fetch('/api/admin/articoli'),
          fetch('/api/admin/categorie')
        ])

        if (artRes.ok) setArticoli(await artRes.json())
        if (catRes.ok) setCategorie(await catRes.json())
      } catch (error) {
        console.error('Errore nel recupero dati:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Scorri all'articolo specifico se c'è il parametro 'articolo' nell'URL
  useEffect(() => {
    if (!loading && articoli.length > 0) {
      const articoloId = searchParams.get('articolo')
      if (articoloId) {
        const element = document.getElementById(`articolo-${articoloId}`)
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
            // Evidenzia momentaneamente l'articolo
            element.classList.add('ring-4', 'ring-primary', 'ring-offset-4')
            setTimeout(() => {
              element.classList.remove('ring-4', 'ring-primary', 'ring-offset-4')
            }, 2000)
          }, 500)
        }
      }
    }
  }, [loading, articoli, searchParams])

  const isPromoValid = (scadenza: string | null) => {
    if (!scadenza) return false
    return new Date(scadenza) > new Date()
  }

  const getArticoliPerCategoria = (categoriaId: string) => {
    return articoli.filter(a => a.categoriaId === categoriaId && a.attivo)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
          <div className="animate-pulse h-4 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header semplificato */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Torna alla Home</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Titolo pagina */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Il Nostro Menu
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Scopri i nostri piatti preparati con ingredienti freschi e di qualità
            </p>
          </div>

          {/* Elenco categorie con articoli */}
          <div className="space-y-12">
            {categorie
              .sort((a, b) => a.ordine - b.ordine)
              .map((categoria) => {
                const articoliCategoria = getArticoliPerCategoria(categoria.id)
                if (articoliCategoria.length === 0) return null

                return (
                  <div key={categoria.id} id={`categoria-${categoria.id}`}>
                    {/* Titolo categoria */}
                    <div className="mb-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <span className="w-2 h-8 bg-primary rounded-full"></span>
                        {categoria.nome}
                      </h2>
                      <div className="h-0.5 bg-gradient-to-r from-primary to-transparent mt-2 ml-4"></div>
                    </div>

                    {/* Grid articoli */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {articoliCategoria.map((articolo) => (
                        <Card
                          key={articolo.id}
                          id={`articolo-${articolo.id}`}
                          className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer scroll-mt-24"
                          onClick={() => {
                            if (isInitialized && !trackedProducts.current.has(articolo.id)) {
                              trackProductView(articolo.id)
                              trackedProducts.current.add(articolo.id)
                            }
                          }}
                        >
                          {/* Immagine */}
                          {articolo.immagineUrl && (
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={articolo.immagineUrl}
                                alt={articolo.nome}
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                              />
                              {/* Badges */}
                              <div className="absolute top-3 left-3 flex gap-2">
                                {articolo.eBestChoice && (
                                  <Badge className="bg-primary hover:bg-primary/90">
                                    <Star className="w-3 h-3 mr-1" />
                                    Best Choice
                                  </Badge>
                                )}
                                {articolo.eSurgelato && (
                                  <Badge className="bg-blue-600 hover:bg-blue-700">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Surgelato
                                  </Badge>
                                )}
                              </div>
                              {/* Sconto promozionale */}
                              {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                                <Badge className="absolute top-3 right-3 bg-red-600 hover:bg-red-700">
                                  -{Math.round((1 - articolo.prezzoPromozionale / articolo.prezzo) * 100)}%
                                </Badge>
                              )}
                              {/* Disclaimer AI */}
                              {articolo.immagineAiGenerata && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm px-2 py-1">
                                  <p className="text-[10px] text-white/80 flex items-center justify-center gap-1">
                                    <Wand2 className="w-2.5 h-2.5" />
                                    Immagine generata con IA
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          <CardContent className="p-5">
                            {/* Nome */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {articolo.nome}
                            </h3>

                            {/* Descrizione */}
                            {articolo.descrizione && (
                              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                {articolo.descrizione}
                              </p>
                            )}

                            {/* Allergeni */}
                            {articolo.allergeni && articolo.allergeni.length > 0 && (
                              <div className="mb-4">
                                <div className="flex flex-wrap gap-2">
                                  {articolo.allergeni.map((allergene) => {
                                    const isSelected = selectedAllergene?.articoloId === articolo.id && selectedAllergene?.allergeneId === allergene.id
                                    return (
                                      <button
                                        key={allergene.id}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors text-lg cursor-pointer ${
                                          isSelected
                                            ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                                            : 'bg-amber-100 hover:bg-amber-200'
                                        }`}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          if (isSelected) {
                                            setSelectedAllergene(null)
                                          } else {
                                            setSelectedAllergene({ articoloId: articolo.id, allergeneId: allergene.id })
                                          }
                                        }}
                                        title={allergene.nome}
                                      >
                                        {allergene.icona || '⚠️'}
                                      </button>
                                    )
                                  })}
                                </div>
                                {/* Descrizione selezionata per touch device */}
                                {selectedAllergene?.articoloId === articolo.id && (
                                  <div className="mt-3 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                                    <p className="font-semibold text-sm text-primary">
                                      {articolo.allergeni.find(a => a.id === selectedAllergene.allergeneId)?.nome}
                                    </p>
                                    {articolo.allergeni.find(a => a.id === selectedAllergene.allergeneId)?.descrizione && (
                                      <p className="text-xs text-primary/80 mt-1">
                                        {articolo.allergeni.find(a => a.id === selectedAllergene.allergeneId)?.descrizione}
                                      </p>
                                    )}
                                  </div>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Tocca le icone per vedere i dettagli degli allergeni
                                </p>
                              </div>
                            )}

                            {/* Prezzo */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                              {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) ? (
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl font-bold text-primary">
                                    €{articolo.prezzoPromozionale.toFixed(2)}
                                  </span>
                                  <span className="text-sm text-gray-400 line-through">
                                    €{articolo.prezzo.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-2xl font-bold text-gray-900">
                                  €{articolo.prezzo.toFixed(2)}
                                </span>
                              )}
                            </div>

                            {/* Scadenza promo */}
                            {articolo.prezzoPromozionale && isPromoValid(articolo.scadenzaPromo) && (
                              <p className="text-xs text-red-600 mt-2">
                                Promo valida fino al {new Date(articolo.scadenzaPromo!).toLocaleDateString('it-IT')}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      </main>

      <Footer />
      <SocialSidebar />
    </div>
  )
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-8 bg-gray-300 rounded w-48 mx-auto mb-4"></div>
          <div className="animate-pulse h-4 bg-gray-300 rounded w-32 mx-auto"></div>
        </div>
      </div>
    }>
      <MenuContent />
    </Suspense>
  )
}