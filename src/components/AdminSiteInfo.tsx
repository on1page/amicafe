'use client'

import { useState, useEffect } from 'react'
import { Save, Globe, Search, Share2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SiteInfo {
  id: string
  nomeLocale?: string | null
  slogan?: string | null
  chiSiamoTitolo?: string | null
  chiSiamoTesto?: string | null
  chiSiamoImageUrl?: string | null
  logoUrl?: string | null
  faviconUrl?: string | null
  telefono?: string | null
  email?: string | null
  prenotazioniAttive?: boolean | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroCTAText?: string | null
  heroImageUrl?: string | null
  heroOverlayOpacity?: number | null
  specialitaTitle?: string | null
  specialitaSubtitle?: string | null
  // SEO
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  seoOgTitle?: string | null
  seoOgDescription?: string | null
  seoOgImage?: string | null
  seoTwitterCard?: string | null
  seoRobots?: string | null
  seoCanonical?: string | null
}

export default function AdminSiteInfo() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    id: '',
    nomeLocale: 'Il Nostro Ristorante',
    slogan: '',
    chiSiamoTitolo: '',
    chiSiamoTesto: '',
    chiSiamoImageUrl: '',
    logoUrl: '',
    faviconUrl: '',
    telefono: '',
    email: '',
    prenotazioniAttive: true,
    heroTitle: 'Autentica Cucina Italiana',
    heroSubtitle: '',
    heroCTAText: 'Scopri il Menu',
    heroImageUrl: '',
    heroOverlayOpacity: 0.5,
    specialitaTitle: 'Le Nostre Specialità',
    specialitaSubtitle: '',
    // SEO
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    seoOgTitle: '',
    seoOgDescription: '',
    seoOgImage: '',
    seoTwitterCard: 'summary_large_image',
    seoRobots: 'index',
    seoCanonical: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('generali')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/site-info')
      if (response.ok) {
        const data = await response.json()
        setSiteInfo(data)
      }
    } catch (error) {
      console.error('Errore nel recupero site info:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteInfo)
      })

      if (response.ok) {
        alert('Impostazioni sito salvate con successo!')
        fetchData()
      } else {
        alert('Errore nel salvataggio')
      }
    } catch (error) {
      console.error('Errore salvataggio:', error)
      alert('Errore di connessione')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Impostazioni Sito</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configura le informazioni del sito e le ottimizzazioni SEO
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva Impostazioni'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="generali">
            <Globe className="w-4 h-4 mr-2" />
            Generali
          </TabsTrigger>
          <TabsTrigger value="hero">
            <Info className="w-4 h-4 mr-2" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Search className="w-4 h-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social">
            <Share2 className="w-4 h-4 mr-2" />
            Social
          </TabsTrigger>
        </TabsList>

        {/* Tab Generali */}
        <TabsContent value="generali" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Informazioni Generali
              </CardTitle>
              <CardDescription>
                Configura le informazioni base del sito
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="nomeLocale">Nome del Locale *</Label>
                <Input
                  id="nomeLocale"
                  value={siteInfo.nomeLocale || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, nomeLocale: e.target.value })}
                  placeholder="Es: La Bella Tavola"
                />
              </div>

              <div>
                <Label htmlFor="slogan">Slogan</Label>
                <Input
                  id="slogan"
                  value={siteInfo.slogan || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, slogan: e.target.value })}
                  placeholder="Es: Cucina autentica dal 1985"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={siteInfo.email || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
                    placeholder="info@ristorante.com"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    value={siteInfo.telefono || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, telefono: e.target.value })}
                    placeholder="+39 02 1234567"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-semibold">Prenotazioni Attive</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    Mostra il sistema di prenotazioni sul sito
                  </p>
                </div>
                <Input
                  type="checkbox"
                  checked={siteInfo.prenotazioniAttive ?? true}
                  onChange={(e) => setSiteInfo({ ...siteInfo, prenotazioniAttive: e.target.checked })}
                  className="w-5 h-5"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Hero */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Sezione Hero
              </CardTitle>
              <CardDescription>
                Configura l'hero section della homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="heroTitle">Titolo Hero</Label>
                <Input
                  id="heroTitle"
                  value={siteInfo.heroTitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroTitle: e.target.value })}
                  placeholder="Autentica Cucina Italiana"
                />
              </div>

              <div>
                <Label htmlFor="heroSubtitle">Sottotitolo Hero</Label>
                <Textarea
                  id="heroSubtitle"
                  value={siteInfo.heroSubtitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroSubtitle: e.target.value })}
                  rows={2}
                  placeholder="Scopri i sapori tradizionali della nostra cucina..."
                />
              </div>

              <div>
                <Label htmlFor="heroCTAText">Testo Bottone CTA</Label>
                <Input
                  id="heroCTAText"
                  value={siteInfo.heroCTAText || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroCTAText: e.target.value })}
                  placeholder="Scopri il Menu"
                />
              </div>

              <div>
                <Label htmlFor="heroImageUrl">URL Immagine Hero</Label>
                <Input
                  id="heroImageUrl"
                  value={siteInfo.heroImageUrl || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroImageUrl: e.target.value })}
                  placeholder="https://esempio.com/hero.jpg"
                />
              </div>

              <div>
                <Label htmlFor="heroOverlayOpacity">Opacità Overlay (0-1)</Label>
                <Input
                  id="heroOverlayOpacity"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={siteInfo.heroOverlayOpacity ?? 0.5}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroOverlayOpacity: parseFloat(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab SEO */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                Ottimizzazione SEO
              </CardTitle>
              <CardDescription>
                Configura i meta tag per migliorare il posizione sui motori di ricerca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Consigli SEO</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Title: 50-60 caratteri</li>
                      <li>Description: 150-160 caratteri</li>
                      <li>Keywords: 5-10 parole chiave separate da virgola</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="seoTitle">Meta Title</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Lunghezza: {(siteInfo.seoTitle || '').length} / 60 caratteri
                  {(siteInfo.seoTitle || '').length > 60 && <span className="text-red-600"> (troppo lungo)</span>}
                </p>
                <Input
                  id="seoTitle"
                  value={siteInfo.seoTitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoTitle: e.target.value })}
                  placeholder="Il Tito del Ristorante | Cucina Autentica"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="seoDescription">Meta Description</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Lunghezza: {(siteInfo.seoDescription || '').length} / 160 caratteri
                  {(siteInfo.seoDescription || '').length > 160 && <span className="text-red-600"> (troppo lungo)</span>}
                </p>
                <Textarea
                  id="seoDescription"
                  value={siteInfo.seoDescription || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoDescription: e.target.value })}
                  rows={3}
                  placeholder="Scopri la cucina autentica al Ristorante XYZ. Specialità regionali, ingredienti freschi e un'atmosfera unica."
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="seoKeywords">Keywords</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Separa le parole chiave con virgole
                </p>
                <Input
                  id="seoKeywords"
                  value={siteInfo.seoKeywords || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoKeywords: e.target.value })}
                  placeholder="ristorante italiano, cucina autentica, specialità regionali"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="seoRobots">Meta Robots</Label>
                <Select
                  value={siteInfo.seoRobots || 'index'}
                  onValueChange={(value) => setSiteInfo({ ...siteInfo, seoRobots: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="index">index (consenti indicizzazione)</SelectItem>
                    <SelectItem value="noindex">noindex (blocca indicizzazione)</SelectItem>
                    <SelectItem value="nofollow">nofollow (non seguire link)</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex,nofollow (nessuno dei due)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="seoCanonical">Canonical URL</Label>
                <p className="text-xs text-gray-500 mb-2">
                  URL preferito per evitare contenuti duplicati
                </p>
                <Input
                  id="seoCanonical"
                  value={siteInfo.seoCanonical || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoCanonical: e.target.value })}
                  placeholder="https://iltuoristorante.com"
                  className="font-mono"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Social */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5 text-primary" />
                Social Media & Open Graph
              </CardTitle>
              <CardDescription>
                Configura le anteprime per la condivisione sui social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-primary">
                    <p className="font-semibold mb-1">Open Graph & Twitter Cards</p>
                    <p>Questi tag migliorano l'aspetto dei link quando condivisi su Facebook, LinkedIn, Twitter e altri social.</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="seoOgTitle">Open Graph Title (Titolo Social)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Se vuoto, usa il Meta Title
                </p>
                <Input
                  id="seoOgTitle"
                  value={siteInfo.seoOgTitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoOgTitle: e.target.value })}
                  placeholder="Il Tuo Ristorante | Cucina Autentica"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="seoOgDescription">Open Graph Description (Descrizione Social)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Se vuoto, usa la Meta Description
                </p>
                <Textarea
                  id="seoOgDescription"
                  value={siteInfo.seoOgDescription || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoOgDescription: e.target.value })}
                  rows={3}
                  placeholder="Scopri la cucina autentica al Ristorante XYZ..."
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="seoOgImage">Open Graph Image (Immagine Social)</Label>
                <p className="text-xs text-gray-500 mb-2">
                  Dimensioni consigliate: 1200x630px
                </p>
                <Input
                  id="seoOgImage"
                  value={siteInfo.seoOgImage || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, seoOgImage: e.target.value })}
                  placeholder="https://iltuoristorante.com/og-image.jpg"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="seoTwitterCard">Twitter Card Type</Label>
                <Select
                  value={siteInfo.seoTwitterCard || 'summary_large_image'}
                  onValueChange={(value) => setSiteInfo({ ...siteInfo, seoTwitterCard: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary (immagine piccola)</SelectItem>
                    <SelectItem value="summary_large_image">Summary Large Image (immagine grande)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="logoUrl">URL Logo</Label>
                <Input
                  id="logoUrl"
                  value={siteInfo.logoUrl || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, logoUrl: e.target.value })}
                  placeholder="https://iltuoristorante.com/logo.png"
                />
              </div>

              <div>
                <Label htmlFor="faviconUrl">URL Favicon</Label>
                <Input
                  id="faviconUrl"
                  value={siteInfo.faviconUrl || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, faviconUrl: e.target.value })}
                  placeholder="https://iltuoristorante.com/favicon.ico"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
