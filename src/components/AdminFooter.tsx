'use client'

import { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Mail, Facebook, Instagram, Linkedin, MessageCircle, Locate, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'

interface FooterInfo {
  id: string
  indirizzo?: string | null
  citta?: string | null
  cap?: string | null
  provincia?: string | null
  latitudine?: number | null
  longitudine?: number | null
  orariApertura?: string | null
  giorniChiusura?: string | null
  telefono?: string | null
  facebookUrl?: string | null
  instagramUrl?: string | null
  twitterUrl?: string | null
  linkedinUrl?: string | null
  whatsappUrl?: string | null
  justeatUrl?: string | null
  deliverooUrl?: string | null
  glovoUrl?: string | null
  ubereatsUrl?: string | null
}

const GIORNI_SETTIMANA = [
  'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
]

export default function AdminFooter() {
  const [footerInfo, setFooterInfo] = useState<FooterInfo>({
    id: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    latitudine: null,
    longitudine: null,
    orariApertura: '',
    giorniChiusura: '',
    telefono: '',
    facebookUrl: '',
    instagramUrl: '',
    twitterUrl: '',
    linkedinUrl: '',
    whatsappUrl: '',
    justeatUrl: '',
    deliverooUrl: '',
    glovoUrl: '',
    ubereatsUrl: ''
  })
  const [loading, setLoading] = useState(true)
  const [geocodingLoading, setGeocodingLoading] = useState(false)

  // Orari in formato semplice testo
  const [orariTesto, setOrariTesto] = useState('')

  // Giorni di chiusura
  const [giorniChiusuraList, setGiorniChiusuraList] = useState<string[]>([])

  useEffect(() => {
    fetchFooterInfo()
  }, [])

  // Carica il testo degli orari quando vengono caricati dal database
  useEffect(() => {
    if (footerInfo.orariApertura) {
      try {
        const parsed = JSON.parse(footerInfo.orariApertura)
        if (Array.isArray(parsed)) {
          // Converte il JSON in testo leggibile
          const testo = parsed.map((item: any) => {
            const orari = Array.isArray(item.orario)
              ? item.orario.join(', ')
              : item.orario
            return `${item.giorno}: ${orari}`
          }).join('\n')
          setOrariTesto(testo)
        }
      } catch (e) {
        // Se non è JSON, usa direttamente il testo
        setOrariTesto(footerInfo.orariApertura)
      }
    }
  }, [footerInfo.orariApertura])

  // Carica i giorni di chiusura dal database
  useEffect(() => {
    if (footerInfo.giorniChiusura) {
      try {
        const parsed = JSON.parse(footerInfo.giorniChiusura)
        if (Array.isArray(parsed)) {
          setGiorniChiusuraList(parsed)
        } else if (typeof parsed === 'string') {
          // Se è una stringa, la aggiungiamo come unico elemento
          setGiorniChiusuraList([parsed])
        }
      } catch (e) {
        // Se non è JSON, potrebbe essere una stringa semplice
        // In questo caso, non la consideriamo come giorno di chiusura valido
        // perché i giorni validi sono solo quelli della lista GIORNI_SETTIMANA
        const valore = footerInfo.giorniChiusura.trim()
        // Controlla se il valore corrisponde a un giorno della settimana
        const giornoValido = GIORNI_SETTIMANA.find(g =>
          valore.toLowerCase().includes(g.toLowerCase()) ||
          g.toLowerCase().includes(valore.toLowerCase())
        )
        if (giornoValido) {
          setGiorniChiusuraList([giornoValido])
        }
      }
    }
  }, [footerInfo.giorniChiusura])

  async function fetchFooterInfo() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/footer')
      if (response.ok) {
        const data = await response.json()
        setFooterInfo(data)
      }
    } catch (error) {
      console.error('Errore nel recupero footer info:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveFooterInfo() {
    try {
      const response = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...footerInfo,
          orariApertura: orariTesto,
          giorniChiusura: JSON.stringify(giorniChiusuraList)
        })
      })

      if (response.ok) {
        alert('Informazioni salvate con successo!')
      } else {
        alert('Errore nel salvataggio delle informazioni')
      }
    } catch (error) {
      console.error('Errore salvataggio footer info:', error)
      alert('Errore nel salvataggio delle informazioni')
    }
  }

  async function detectCoordinates() {
    const { indirizzo, citta, cap, provincia } = footerInfo

    if (!indirizzo || !citta) {
      alert('Inserisci almeno indirizzo e città per rilevare le coordinate')
      return
    }

    setGeocodingLoading(true)
    try {
      // Costruisci l'indirizzo completo
      const fullAddress = `${indirizzo}, ${cap || ''} ${citta} ${provincia || ''}, Italia`

      // Usa l'API Nominatim di OpenStreetMap (gratuita)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'RistoranteWebsite'
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data && data.length > 0) {
          setFooterInfo({
            ...footerInfo,
            latitudine: parseFloat(data[0].lat),
            longitudine: parseFloat(data[0].lon)
          })
          alert('Coordinate rilevate con successo!')
        } else {
          alert('Impossibile trovare le coordinate per questo indirizzo. Verifica che l\'indirizzo sia corretto.')
        }
      } else {
        alert('Errore durante il rilevamento delle coordinate. Riprova più tardi.')
      }
    } catch (error) {
      console.error('Errore geocodifica:', error)
      alert('Errore durante il rilevamento delle coordinate. Riprova più tardi.')
    } finally {
      setGeocodingLoading(false)
    }
  }

  function toggleGiornoChiusura(giorno: string) {
    if (giorniChiusuraList.includes(giorno)) {
      setGiorniChiusuraList(giorniChiusuraList.filter(g => g !== giorno))
    } else {
      setGiorniChiusuraList([...giorniChiusuraList, giorno])
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestione Footer</h2>
        <Button onClick={saveFooterInfo}>
          <Save className="w-4 h-4 mr-2" />
          Salva Tutte le Informazioni
        </Button>
      </div>

      <Tabs defaultValue="indirizzo">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="indirizzo">Indirizzo</TabsTrigger>
          <TabsTrigger value="orari">Orari</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
        </TabsList>

        <TabsContent value="indirizzo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Indirizzo e Contatti
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Indirizzo *</Label>
                  <Input
                    value={footerInfo.indirizzo || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, indirizzo: e.target.value })}
                    placeholder="Via Roma 123"
                  />
                </div>
                <div>
                  <Label>Città *</Label>
                  <Input
                    value={footerInfo.citta || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, citta: e.target.value })}
                    placeholder="Milano"
                  />
                </div>
                <div>
                  <Label>CAP</Label>
                  <Input
                    value={footerInfo.cap || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, cap: e.target.value })}
                    placeholder="20100"
                  />
                </div>
                <div>
                  <Label>Provincia</Label>
                  <Input
                    value={footerInfo.provincia || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, provincia: e.target.value })}
                    placeholder="MI"
                  />
                </div>
                <div>
                  <Label>Latitudine</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="any"
                      value={footerInfo.latitudine || ''}
                      onChange={(e) => setFooterInfo({ ...footerInfo, latitudine: parseFloat(e.target.value) || null })}
                      placeholder="45.4642"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={detectCoordinates}
                      disabled={geocodingLoading}
                      title="Rileva coordinate dall'indirizzo"
                    >
                      {geocodingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Locate className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label>Longitudine</Label>
                  <Input
                    type="number"
                    step="any"
                    value={footerInfo.longitudine || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, longitudine: parseFloat(e.target.value) || null })}
                    placeholder="9.1900"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Clicca l'icona 📍 per rilevare automaticamente latitudine e longitudine dall'indirizzo inserito.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orari">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Orari di Apertura
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Orari di Apertura</Label>
                <Textarea
                  value={orariTesto}
                  onChange={(e) => setOrariTesto(e.target.value)}
                  placeholder="Lunedì: 12:00 - 15:00, 19:00 - 23:00&#10;Martedì: 12:00 - 15:00, 19:00 - 23:00&#10;Mercoledì: Chiuso&#10;Giovedì: 12:00 - 15:00, 19:00 - 23:00&#10;Venerdì: 12:00 - 15:00, 19:00 - 23:00&#10;Sabato: 12:00 - 23:00&#10;Domenica: 12:00 - 23:00"
                  rows={10}
                  className="mt-2"
                />
              </div>
              <p className="text-sm text-gray-500">
                💡 Inserisci gli orari di apertura. Esempio: "Lunedì: 12:00 - 15:00, 19:00 - 23:00". Ogni riga rappresenta un giorno diverso. Scrivi "Chiuso" per i giorni di riposo.
              </p>

              <div className="border-t pt-4">
                <Label className="font-semibold">Giorni di Chiusura</Label>
                <p className="text-sm text-gray-500 mb-3">Seleziona i giorni in cui il locale è chiuso:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {GIORNI_SETTIMANA.map((giorno) => (
                    <div key={giorno} className="flex items-center gap-2">
                      <Checkbox
                        id={`chiusura-${giorno}`}
                        checked={giorniChiusuraList.includes(giorno)}
                        onCheckedChange={() => toggleGiornoChiusura(giorno)}
                      />
                      <Label htmlFor={`chiusura-${giorno}`} className="cursor-pointer">
                        {giorno}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5" />
                Social Media
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    Telefono
                  </Label>
                  <Input
                    value={footerInfo.telefono || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, telefono: e.target.value })}
                    placeholder="+39 123 456 7890"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Facebook className="w-4 h-4 text-blue-600" />
                    Facebook URL
                  </Label>
                  <Input
                    value={footerInfo.facebookUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, facebookUrl: e.target.value })}
                    placeholder="https://facebook.com/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-600" />
                    Instagram URL
                  </Label>
                  <Input
                    value={footerInfo.instagramUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <span className="w-4 h-4 flex items-center justify-center font-bold text-sky-500 text-sm">X</span>
                    X URL
                  </Label>
                  <Input
                    value={footerInfo.twitterUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, twitterUrl: e.target.value })}
                    placeholder="https://x.com/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-blue-700" />
                    LinkedIn URL
                  </Label>
                  <Input
                    value={footerInfo.linkedinUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/company/tuoristorante"
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp URL
                  </Label>
                  <Input
                    value={footerInfo.whatsappUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, whatsappUrl: e.target.value })}
                    placeholder="https://wa.me/391234567890"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Inserisci solo i link dei social che vuoi mostrare. I campi vuoti non verranno visualizzati.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle>App di Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Just Eat URL</Label>
                  <Input
                    value={footerInfo.justeatUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, justeatUrl: e.target.value })}
                    placeholder="https://www.justeat.it/ristoranti/tuoristorante"
                  />
                </div>
                <div>
                  <Label>Deliveroo URL</Label>
                  <Input
                    value={footerInfo.deliverooUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, deliverooUrl: e.target.value })}
                    placeholder="https://deliveroo.it/it/it/menu/tuoristorante"
                  />
                </div>
                <div>
                  <Label>Glovo URL</Label>
                  <Input
                    value={footerInfo.glovoUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, glovoUrl: e.target.value })}
                    placeholder="https://glovoapp.com/it/it/store/tuoristorante"
                  />
                </div>
                <div>
                  <Label>Uber Eats URL</Label>
                  <Input
                    value={footerInfo.ubereatsUrl || ''}
                    onChange={(e) => setFooterInfo({ ...footerInfo, ubereatsUrl: e.target.value })}
                    placeholder="https://www.ubereats.com/it/store/tuoristorante"
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Inserisci solo i link delle app che utilizzi. I campi vuoti non verranno visualizzati.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
