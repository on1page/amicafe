'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ChiSiamo from '@/components/ChiSiamo'
import SpecialitaCarousel from '@/components/SpecialitaCarousel'
import HomeEventi from '@/components/HomeEventi'
import Footer from '@/components/Footer'
import SocialSidebar from '@/components/SocialSidebar'
import AdminPanel from '@/components/AdminPanel'
import LoginDialog from '@/components/LoginDialog'

interface SiteInfo {
  nomeLocale?: string
  slogan?: string
  chiSiamoTitolo?: string
  chiSiamoTesto?: string
  chiSiamoImageUrl?: string
  logoUrl?: string
  faviconUrl?: string
  prenotazioniAttive?: boolean
  heroTitle?: string
  heroSubtitle?: string
  heroCTAText?: string
  heroImageUrl?: string
  heroOverlayOpacity?: number
  specialitaTitle?: string
  specialitaSubtitle?: string
}

export default function Home() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({})
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // Inizializza sempre a false per evitare hydration mismatch

  useEffect(() => {
    // Verifica se l'utente è già loggato (solo lato client)
    const token = localStorage.getItem('adminToken')
    if (token) {
      setIsLoggedIn(true) // eslint-disable-line react-hooks/set-state-in-effect
    }

    // Recupera le informazioni del sito
    async function fetchSiteInfo() {
      try {
        const response = await fetch('/api/admin/site-info')
        if (response.ok) {
          const data = await response.json()
          setSiteInfo(data)
        }
      } catch (error) {
        console.error('Errore nel recupero site info:', error)
      }
    }

    fetchSiteInfo()
  }, [])

  const handleAdminClick = () => {
    if (isLoggedIn) {
      setShowAdminPanel(true)
    } else {
      setShowLoginDialog(true)
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    setShowLoginDialog(false)
    setShowAdminPanel(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsLoggedIn(false)
    setShowAdminPanel(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        siteName={siteInfo.nomeLocale || 'Il Nostro Ristorante'}
        logoUrl={siteInfo.logoUrl}
        onAdminClick={handleAdminClick}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        prenotazioniAttive={siteInfo.prenotazioniAttive ?? true}
      />

      <main className="flex-1">
        <Hero
          title={siteInfo.heroTitle || 'Autentica Cucina Italiana'}
          subtitle={siteInfo.heroSubtitle || 'Scopri i sapori tradizionali della nostra cucina, preparati con passione e ingredienti freschi ogni giorno'}
          heroImage={siteInfo.heroImageUrl}
          ctaText={siteInfo.heroCTAText || 'Scopri il Menu'}
          heroOverlayOpacity={siteInfo.heroOverlayOpacity ?? 0.5}
        />

        <ChiSiamo
          title={siteInfo.chiSiamoTitolo || 'Chi Siamo'}
          content={siteInfo.chiSiamoTesto || 'Dal 1985, portiamo in tavola l\'autentica tradizione culinaria italiana. La nostra passione per la cucina e l\'amore per gli ingredienti freschi e di qualità si riflette in ogni piatto che prepariamo.'}
          image={siteInfo.chiSiamoImageUrl}
        />

        <SpecialitaCarousel
          showBestChoice={true}
          showPromo={true}
          limit={6}
          title={siteInfo.specialitaTitle || 'Le Nostre Specialità'}
          subtitle={siteInfo.specialitaSubtitle || 'Scopri i piatti più amati dai nostri clienti e le offerte speciali del momento'}
        />

        <HomeEventi />
      </main>

      <Footer onAdminClick={handleAdminClick} />
      <SocialSidebar />

      {/* Login Dialog */}
      {showLoginDialog && (
        <LoginDialog
          onClose={() => setShowLoginDialog(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}
    </div>
  )
}
