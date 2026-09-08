'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface HeroProps {
  title?: string
  subtitle?: string
  heroImage?: string
  ctaText?: string
  heroOverlayOpacity?: number
}

export default function Hero({
  title = "Autentica Cucina Italiana",
  subtitle = "Scopri i sapori tradizionali della nostra cucina, preparati con passione e ingredienti freschi ogni giorno",
  heroImage = "/images/hero.jpg",
  ctaText = "Scopri il Menu",
  heroOverlayOpacity = 0.5
}: HeroProps) {
  const router = useRouter()
  const [dynamicHeroImage, setDynamicHeroImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchHeroImage() {
      try {
        const response = await fetch('/api/admin/images?sezione=hero')
        if (response.ok) {
          const images = await response.json()
          // Prendi la prima immagine attiva della sezione hero
          const activeImage = images.find((img: any) => img.attiva)
          if (activeImage && activeImage.url) {
            setDynamicHeroImage(activeImage.url)
          }
        }
      } catch (error) {
        console.error('Errore nel recupero dell\'immagine hero:', error)
      }
    }

    fetchHeroImage()
  }, [])

  const backgroundImage = dynamicHeroImage || heroImage

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      >
        <div className="absolute inset-0 bg-black/50" style={{ opacity: heroOverlayOpacity }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
          {subtitle}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            onClick={() => router.push('/menu')}
          >
            {ctaText}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-6 text-lg"
            onClick={() => document.getElementById('contatti')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contattaci
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-2">
          <div className="w-1 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
