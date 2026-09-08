'use client'

import { useEffect, useState } from 'react'
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Utensils,
  Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FooterInfo {
  indirizzo?: string
  citta?: string
  cap?: string
  provincia?: string
  latitudine?: number | null
  longitudine?: number | null
  orariApertura?: string | null
  giorniChiusura?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  whatsappUrl?: string | null
  justeatUrl?: string | null
  deliverooUrl?: string | null
  glovoUrl?: string | null
  ubereatsUrl?: string | null
  telefono?: string | null
  email?: string | null
}

interface CompanyData {
  ragioneSociale?: string | null
  partitaIva?: string | null
  privacyPolicy?: string | null
  privacyEnabled?: boolean
  cookiesPolicy?: string | null
  cookiesEnabled?: boolean
  privacyUrl?: string | null
  cookiesUrl?: string | null
}

interface FooterProps {
  onAdminClick?: () => void
}

export default function Footer({ onAdminClick }: FooterProps = {}) {
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({})
  const [companyData, setCompanyData] = useState<CompanyData>({})

  useEffect(() => {
    async function fetchData() {
      try {
        const [footerRes, companyRes] = await Promise.all([
          fetch('/api/admin/footer'),
          fetch('/api/admin/company-data')
        ])

        if (footerRes.ok) {
          const data = await footerRes.json()
          setFooterInfo(data)
        }

        if (companyRes.ok) {
          const data = await companyRes.json()
          setCompanyData(data)
        }
      } catch (error) {
        console.error('Errore nel recupero dati:', error)
      }
    }

    fetchData()
  }, [])

  const getAddressString = () => {
    const parts = [footerInfo.indirizzo, footerInfo.cap, footerInfo.citta, footerInfo.provincia]
    return parts.filter(Boolean).join(', ')
  }

  const getDirectionsUrl = () => {
    if (footerInfo.latitudine && footerInfo.longitudine) {
      return `https://www.google.com/maps/dir/?api=1&destination=${footerInfo.latitudine},${footerInfo.longitudine}`
    }
    const address = getAddressString()
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  const parseOrari = () => {
    if (!footerInfo.orariApertura) return []
    // Prova prima a fare il parsing JSON per compatibilità con vecchi dati
    try {
      const parsed = JSON.parse(footerInfo.orariApertura)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Se non è JSON, è un testo semplice: dividi per riga
      return footerInfo.orariApertura.split('\n').filter(line => line.trim())
    }
    return []
  }

  const parseGiorniChiusura = () => {
    if (!footerInfo.giorniChiusura) return []
    try {
      return JSON.parse(footerInfo.giorniChiusura)
    } catch {
      return []
    }
  }

  const orari = parseOrari()
  const giorniChiusura = parseGiorniChiusura()

  const deliveryApps = [
    { name: 'Just Eat', url: footerInfo.justeatUrl, icon: Utensils },
    { name: 'Deliveroo', url: footerInfo.deliverooUrl, icon: Utensils },
    { name: 'Glovo', url: footerInfo.glovoUrl, icon: Utensils },
    { name: 'Uber Eats', url: footerInfo.ubereatsUrl, icon: Utensils }
  ].filter(app => app.url)

  const socialLinks = [
    { name: 'Telefono', url: footerInfo.telefono ? `tel:${footerInfo.telefono}` : null, icon: Phone },
    { name: 'Facebook', url: footerInfo.facebookUrl, icon: Facebook },
    { name: 'Instagram', url: footerInfo.instagramUrl, icon: Instagram },
    { name: 'X', url: footerInfo.twitterUrl, icon: () => <span className="w-4 h-4 flex items-center justify-center font-bold text-sm">X</span> },
    { name: 'LinkedIn', url: footerInfo.linkedinUrl, icon: Linkedin }
  ].filter(social => social.url)

  return (
    <footer id="contatti" className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Mappa */}
          {(footerInfo.indirizzo || footerInfo.citta) && (
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="text-primary" />
                Dove Trovarci
              </h3>
              <div className="bg-gray-800 rounded-xl overflow-hidden mb-4">
                {footerInfo.latitudine && footerInfo.longitudine ? (
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${footerInfo.latitudine},${footerInfo.longitudine}&z=15&output=embed`}
                    className="border-0"
                  />
                ) : (
                  <iframe
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(getAddressString())}&z=15&output=embed`}
                    className="border-0"
                  />
                )}
              </div>
              <p className="text-gray-300 mb-4">{getAddressString()}</p>
              <Button
                onClick={() => window.open(getDirectionsUrl(), '_blank')}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Ottieni Indicazioni
              </Button>
            </div>
          )}

          {/* Orari */}
          {(orari.length > 0 || giorniChiusura.length > 0) && (
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="text-primary" />
                Orari
              </h3>
              <div className="space-y-2">
                {orari.map((orario: any, index: number) => {
                  // Gestisce sia formato JSON ({giorno: 'Lunedì', orario: '...'})
                  // che formato testo semplice ('Lunedì: ...')
                  if (typeof orario === 'string') {
                    // È testo semplice, mostra direttamente
                    const [day, ...timeParts] = orario.split(':')
                    const timeStr = timeParts.join(':').trim()
                    return (
                      <div key={index} className="text-gray-300">
                        <div className="font-medium text-white mb-1">{day.trim()}</div>
                        <div className="text-sm pl-2">{timeStr}</div>
                      </div>
                    )
                  }

                  // È formato JSON
                  const orarioStr = Array.isArray(orario.orario)
                    ? orario.orario.join(', ')
                    : orario.orario

                  return (
                    <div key={index} className="text-gray-300">
                      <div className="font-medium text-white mb-1">{orario.giorno}</div>
                      <div className="text-sm pl-2">{orarioStr}</div>
                    </div>
                  )
                })}
                {giorniChiusura.length > 0 && (
                  <div className="pt-2 border-t border-gray-700">
                    <p className="text-sm text-gray-400">
                      Chiuso: {giorniChiusura.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contatti e Delivery */}
          <div>
            {footerInfo.email && (
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Mail className="text-primary" />
                Contatti
              </h3>
            )}
            <div className="space-y-3 mb-6">
              {footerInfo.email && (
                <a
                  href={`mailto:${footerInfo.email}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {footerInfo.email}
                </a>
              )}
            </div>

            {/* Delivery Apps */}
            {deliveryApps.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Ordina Online</h3>
                <div className="grid grid-cols-2 gap-2">
                  {deliveryApps.map((app) => (
                    <Button
                      key={app.name}
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(app.url!, '_blank')}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {app.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold mb-3">Seguici</h3>
                <div className="flex gap-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon
                    return (
                      <Button
                        key={social.name}
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(social.url!, '_blank')}
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      >
                        <Icon className="w-4 h-4" />
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center text-gray-400 text-sm space-y-2 sm:space-y-0">
              {/* Dati Aziendali e Copyright */}
              <div className="text-center sm:text-left space-y-2">
                {(companyData.ragioneSociale || companyData.partitaIva) && (
                  <p className="text-white">
                    {companyData.ragioneSociale && <span className="font-medium">{companyData.ragioneSociale}</span>}
                    {companyData.ragioneSociale && companyData.partitaIva && <span className="mx-2">•</span>}
                    {companyData.partitaIva && <span>P.IVA: {companyData.partitaIva}</span>}
                  </p>
                )}
                <p>&copy; {new Date().getFullYear()} Tutti i diritti riservati.</p>
              </div>

              {/* Icona Admin e Link Policy */}
              <div className="flex items-center gap-4">
                {/* Icona Admin */}
                {onAdminClick && (
                  <button
                    onClick={onAdminClick}
                    className="p-2 rounded-lg hover:bg-gray-800 hover:text-white transition-colors text-gray-400"
                    aria-label="Admin"
                    title="Admin"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}

                {/* Link Policy */}
                <div className="flex gap-4">
                  {(companyData.privacyEnabled !== false) && (
                    <a
                      href={companyData.privacyUrl || '/privacy-policy'}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  )}
                  {(companyData.cookiesEnabled !== false) && (
                    <a
                      href={companyData.cookiesUrl || '/cookie-policy'}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Cookie Policy
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
