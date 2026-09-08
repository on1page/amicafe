'use client'

import { useState, useEffect } from 'react'
import { Facebook, Instagram, X as XIcon, MessageCircle, X, Share2 } from 'lucide-react'

interface SocialSidebarProps {
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  whatsappUrl?: string | null
}

export default function SocialSidebar() {
  const [footerInfo, setFooterInfo] = useState<SocialSidebarProps>({})
  const [isOpen, setIsOpen] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    // Imposta l'URL solo sul client per evitare problemi di idratazione
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentUrl(window.location.href)

    async function fetchFooterInfo() {
      try {
        const response = await fetch('/api/admin/footer')
        if (response.ok) {
          const data = await response.json()
          setFooterInfo(data)
        }
      } catch (error) {
        console.error('Errore nel recupero footer info:', error)
      }
    }

    fetchFooterInfo()
  }, [])

  // Testo personalizzato per la condivisione
  const shareText = 'TE LO CONSIGLIO !'

  // Genera URL di sharing per ogni social
  const generateShareUrl = (platform: string) => {
    const encodedUrl = encodeURIComponent(currentUrl)
    const encodedText = encodeURIComponent(shareText)

    switch (platform) {
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
      case 'x':
        return `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
      case 'whatsapp':
        return `https://wa.me/?text=${encodedText} ${encodedUrl}`
      case 'instagram':
        return 'https://www.instagram.com'
      default:
        return '#'
    }
  }

  const socialLinks = [
    {
      name: 'Facebook',
      url: generateShareUrl('facebook'),
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      isShare: true
    },
    {
      name: 'X',
      url: generateShareUrl('x'),
      icon: XIcon,
      color: 'bg-black hover:bg-gray-800',
      isShare: true
    },
    {
      name: 'Instagram',
      url: generateShareUrl('instagram'),
      icon: Instagram,
      color: 'bg-gradient-to-br from-purple-600 via-pink-600 to-primary hover:from-purple-700 hover:via-pink-700 hover:to-primary/90',
      isShare: false,
      action: 'copy-and-open'
    },
    {
      name: 'WhatsApp',
      url: generateShareUrl('whatsapp'),
      icon: MessageCircle,
      color: 'bg-green-600 hover:bg-green-700',
      isShare: true
    }
  ].filter(social => social.url && social.url !== '#')

  const handleSocialClick = async (social: any, e: React.MouseEvent) => {
    if (social.name === 'Instagram') {
      e.preventDefault()
      
      // Copia il link negli appunti in silenzio
      try {
        await navigator.clipboard.writeText(currentUrl)
        console.log('Link copiato negli appunti')
      } catch (err) {
        console.error('Errore nella copia:', err)
      }
      
      // Apre Instagram.com
      window.open(social.url, '_blank')
    } else {
      // Apri la finestra di condivisione
      const width = 600
      const height = 400
      const left = (window.screen.width - width) / 2
      const top = (window.screen.height - height) / 2
      window.open(
        social.url,
        'Condividi',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      )
      e.preventDefault()
    }
  }

  return (
    <>
      {/* Container Principale - Tendina attaccata a sinistra */}
      <div
        className={`fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-white shadow-xl transition-all duration-300 ${
          isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[100%] pointer-events-none'
        }`}
        style={{
          maxHeight: '70vh',
          borderTopRightRadius: '1rem',
          borderBottomRightRadius: '1rem',
          borderTopLeftRadius: '0',
          borderBottomLeftRadius: '0'
        }}
      >
        {/* Header della Tendina con solo X di chiusura */}
        <div className="flex justify-end items-center p-2 border-r border-gray-200 bg-gray-50">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors group"
            aria-label="Chiudi"
          >
            <X className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-700 transition-colors" />
          </button>
        </div>

        {/* Lista Social - Solo icone senza nomi */}
        <div className="p-2 space-y-2 border-r border-gray-200 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 48px)' }}>
          {socialLinks.map((social) => {
            const Icon = social.icon
            return (
              <a
                key={social.name}
                href={social.url}
                onClick={(e) => handleSocialClick(social, e)}
                target={social.name === 'Instagram' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`flex justify-center items-center w-12 h-12 rounded-full ${social.color} text-white hover:scale-105 hover:shadow-md transition-all duration-200`}
                aria-label={`Condividi su ${social.name}`}
                title={`Condividi su ${social.name}`}
              >
                <Icon className="w-6 h-6" />
              </a>
            )
          })}
        </div>
      </div>

      {/* Pulsante per riaprire la tendina */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-r-lg shadow-lg hover:scale-110 transition-all duration-300"
          aria-label="Apri menu social"
          title="Condividi"
          style={{ borderTopRightRadius: '0.5rem', borderBottomRightRadius: '0.5rem', borderTopLeftRadius: '0', borderBottomLeftRadius: '0' }}
        >
          <Share2 className="w-5 h-5" />
        </button>
      )}
    </>
  )
}
