'use client'

import { useState, useEffect, useRef } from 'react'
import { Save, Plus, Trash2, Image as ImageIcon, FileText, Layout, Home, Info, Star, Upload, X, Loader2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  prenotazioniAttive?: boolean
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroCTAText?: string | null
  heroImageUrl?: string | null
  heroOverlayOpacity?: number
  specialitaTitle?: string | null
  specialitaSubtitle?: string | null
  primaryColor?: string | null
  primaryForeground?: string | null
}

interface SiteImage {
  id: string
  sezione: string
  titolo?: string | null
  descrizione?: string | null
  url: string
  ordine: number
  attiva: boolean
}

// Componente per l'upload delle immagini
interface ImageUploadProps {
  imageUrl?: string
  onImageUrlChange: (url: string) => void
  label: string
  accept?: string
  className?: string
}

function ImageUpload({ imageUrl, onImageUrlChange, label, accept = "image/*", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validazione dimensione (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Il file supera la dimensione massima di 5MB')
      return
    }

    // Validazione tipo
    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Simula progresso
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 100)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (response.ok) {
        const data = await response.json()
        onImageUrlChange(data.url)
        setUploadProgress(100)
        alert('Immagine caricata con successo!')
      } else {
        const error = await response.json()
        alert(error.error || 'Errore durante il caricamento dell\'immagine')
      }
    } catch (error) {
      console.error('Errore upload:', error)
      alert('Errore durante il caricamento dell\'immagine')
    } finally {
      setUploading(false)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = () => {
    onImageUrlChange('')
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          type="text"
          value={imageUrl || ''}
          onChange={(e) => onImageUrlChange(e.target.value)}
          placeholder="https://... o carica un file"
          disabled={uploading}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id={`upload-${label.replace(/\s+/g, '-')}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          size="icon"
          title="Carica immagine dal computer"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
        {imageUrl && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemoveImage}
            disabled={uploading}
            size="icon"
            title="Rimuovi immagine"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-600">Caricamento in corso... {uploadProgress}%</p>
        </div>
      )}
      {imageUrl && !uploading && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Anteprima:</p>
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  )
}

export default function AdminTheme() {
  const [siteInfo, setSiteInfo] = useState<SiteInfo>({
    id: '',
    nomeLocale: '',
    slogan: '',
    chiSiamoTitolo: '',
    chiSiamoTesto: '',
    chiSiamoImageUrl: '',
    logoUrl: '',
    faviconUrl: '',
    telefono: '',
    email: '',
    prenotazioniAttive: true,
    heroTitle: '',
    heroSubtitle: '',
    heroCTAText: '',
    heroImageUrl: '',
    heroOverlayOpacity: 0.5,
    specialitaTitle: '',
    specialitaSubtitle: '',
    primaryColor: '#ea580c',
    primaryForeground: '#ffffff'
  })
  const [images, setImages] = useState<SiteImage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Image form
  const [imageForm, setImageForm] = useState({
    id: '',
    sezione: 'hero',
    titolo: '',
    descrizione: '',
    url: '',
    ordine: 0,
    attiva: true
  })
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [selectedSection, setSelectedSection] = useState('hero')

  useEffect(() => {
    fetchData()
  }, [selectedSection])

  async function fetchData() {
    setLoading(true)
    try {
      const [siteRes, imgRes] = await Promise.all([
        fetch('/api/admin/site-info'),
        fetch(`/api/admin/images?sezione=${selectedSection}`)
      ])

      if (siteRes.ok) setSiteInfo(await siteRes.json())
      if (imgRes.ok) setImages(await imgRes.json())
    } catch (error) {
      console.error('Errore nel recupero dati:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSiteInfo() {
    setSaving(true)
    try {
      console.log('Salvataggio siteInfo:', JSON.stringify(siteInfo, null, 2))

      const response = await fetch('/api/admin/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteInfo)
      })

      if (response.ok) {
        alert('Informazioni del sito salvate con successo!')
      } else {
        const errorData = await response.json()
        console.error('Errore risposta server:', errorData)
        alert(`Errore nel salvataggio:\n${errorData.error}\n\nDettagli: ${errorData.details}\nTipo: ${errorData.errorType}`)
      }
    } catch (error) {
      console.error('Errore salvataggio site info:', error)
      alert(`Errore di rete o server:\n${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setSaving(false)
    }
  }

  async function saveImage() {
    const url = imageForm.id
      ? `/api/admin/images/${imageForm.id}`
      : '/api/admin/images'
    const method = imageForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(imageForm)
      })

      if (response.ok) {
        setShowImageDialog(false)
        resetImageForm()
        fetchData()
      }
    } catch (error) {
      console.error('Errore salvataggio immagine:', error)
    }
  }

  async function deleteImage(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa immagine?')) return

    try {
      const response = await fetch(`/api/admin/images/${id}`, { method: 'DELETE' })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Errore eliminazione immagine:', error)
    }
  }

  async function toggleImageActive(id: string, attiva: boolean) {
    try {
      const response = await fetch(`/api/admin/images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attiva })
      })
      if (response.ok) fetchData()
    } catch (error) {
      console.error('Errore aggiornamento immagine:', error)
    }
  }

  function editImage(img: SiteImage) {
    setImageForm({
      id: img.id,
      sezione: img.sezione,
      titolo: img.titolo || '',
      descrizione: img.descrizione || '',
      url: img.url,
      ordine: img.ordine,
      attiva: img.attiva
    })
    setShowImageDialog(true)
  }

  function resetImageForm() {
    setImageForm({
      id: '',
      sezione: selectedSection,
      titolo: '',
      descrizione: '',
      url: '',
      ordine: 0,
      attiva: true
    })
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-7">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="chi-siamo">Chi Siamo</TabsTrigger>
          <TabsTrigger value="specialita">Specialità</TabsTrigger>
          <TabsTrigger value="info">Generali</TabsTrigger>
          <TabsTrigger value="temi">Temi</TabsTrigger>
          <TabsTrigger value="images">Immagini</TabsTrigger>
          <TabsTrigger value="prenotazioni">Prenotazioni</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Home className="w-6 h-6" />
              Sezione Hero
            </h2>
            <Button onClick={saveSiteInfo} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Testo Hero</CardTitle>
              <CardDescription>Configura il testo principale della hero section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titolo Principale *</Label>
                <Input
                  value={siteInfo.heroTitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroTitle: e.target.value })}
                  placeholder="Autentica Cucina Italiana"
                />
              </div>
              <div>
                <Label>Sottotitolo</Label>
                <Textarea
                  value={siteInfo.heroSubtitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroSubtitle: e.target.value })}
                  rows={3}
                  placeholder="Scopri i sapori tradizionali della nostra cucina..."
                />
              </div>
              <div>
                <Label>Testo Bottone CTA *</Label>
                <Input
                  value={siteInfo.heroCTAText || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, heroCTAText: e.target.value })}
                  placeholder="Scopri il Menu"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Immagine di Sfondo</CardTitle>
              <CardDescription>Carica o inserisci l'URL dell'immagine di sfondo della hero</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                imageUrl={siteInfo.heroImageUrl || ''}
                onImageUrlChange={(url) => setSiteInfo({ ...siteInfo, heroImageUrl: url })}
                label="Immagine Hero"
                accept="image/*"
              />
              <div>
                <Label>Opacità Overlay: {siteInfo.heroOverlayOpacity?.toFixed(2) || 0.5}</Label>
                <Slider
                  value={[siteInfo.heroOverlayOpacity || 0.5]}
                  onValueChange={([value]) => setSiteInfo({ ...siteInfo, heroOverlayOpacity: value })}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chi Siamo Section */}
        <TabsContent value="chi-siamo" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Info className="w-6 h-6" />
              Sezione Chi Siamo
            </h2>
            <Button onClick={saveSiteInfo} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contenuti Testuali</CardTitle>
              <CardDescription>Configura titolo e descrizione della sezione Chi Siamo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titolo Sezione *</Label>
                <Input
                  value={siteInfo.chiSiamoTitolo || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, chiSiamoTitolo: e.target.value })}
                  placeholder="Chi Siamo"
                />
              </div>
              <div>
                <Label>Testo Descrittivo *</Label>
                <Textarea
                  value={siteInfo.chiSiamoTesto || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, chiSiamoTesto: e.target.value })}
                  rows={6}
                  placeholder="Dal 1985, portiamo in tavola l'autentica tradizione culinaria italiana..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Immagine Sezione</CardTitle>
              <CardDescription>Carica o inserisci l'URL dell'immagine della sezione Chi Siamo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUpload
                imageUrl={siteInfo.chiSiamoImageUrl || ''}
                onImageUrlChange={(url) => setSiteInfo({ ...siteInfo, chiSiamoImageUrl: url })}
                label="Immagine Chi Siamo"
                accept="image/*"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Specialità Section */}
        <TabsContent value="specialita" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6" />
              Sezione Specialità
            </h2>
            <Button onClick={saveSiteInfo} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Contenuti Testuali</CardTitle>
              <CardDescription>Configura titolo e sottotitolo della sezione Specialità</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titolo Sezione *</Label>
                <Input
                  value={siteInfo.specialitaTitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, specialitaTitle: e.target.value })}
                  placeholder="Le Nostre Specialità"
                />
              </div>
              <div>
                <Label>Sottotitolo</Label>
                <Textarea
                  value={siteInfo.specialitaSubtitle || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, specialitaSubtitle: e.target.value })}
                  rows={3}
                  placeholder="Scopri i piatti più amati dai nostri clienti..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Info Generali */}
        <TabsContent value="info" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Layout className="w-6 h-6" />
              Informazioni Generali
            </h2>
            <Button onClick={saveSiteInfo} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Nome e Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome del Locale *</Label>
                <Input
                  value={siteInfo.nomeLocale || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, nomeLocale: e.target.value })}
                  placeholder="Il Nostro Ristorante"
                />
              </div>
              <div>
                <Label>Slogan Generale</Label>
                <Input
                  value={siteInfo.slogan || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, slogan: e.target.value })}
                  placeholder="Slogan del locale"
                />
              </div>
              <ImageUpload
                imageUrl={siteInfo.logoUrl || ''}
                onImageUrlChange={(url) => setSiteInfo({ ...siteInfo, logoUrl: url })}
                label="URL Logo"
                accept="image/*"
              />
              <ImageUpload
                imageUrl={siteInfo.faviconUrl || ''}
                onImageUrlChange={(url) => setSiteInfo({ ...siteInfo, faviconUrl: url })}
                label="URL Favicon"
                accept="image/x-icon,image/png"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contatti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Telefono</Label>
                <Input
                  value={siteInfo.telefono || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, telefono: e.target.value })}
                  placeholder="+39 012 345 6789"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={siteInfo.email || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
                  placeholder="info@tuoristorante.it"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Temi */}
        <TabsContent value="temi" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Palette className="w-6 h-6" />
              Temi e Colori
            </h2>
            <Button onClick={saveSiteInfo} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Colore Primario</CardTitle>
              <CardDescription>Personalizza il colore principale del sito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Colore Primario</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    type="color"
                    value={siteInfo.primaryColor || '#ea580c'}
                    onChange={(e) => setSiteInfo({ ...siteInfo, primaryColor: e.target.value })}
                    className="w-20 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={siteInfo.primaryColor || '#ea580c'}
                    onChange={(e) => setSiteInfo({ ...siteInfo, primaryColor: e.target.value })}
                    placeholder="#ea580c"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Colore Testo su Primario</Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    type="color"
                    value={siteInfo.primaryForeground || '#ffffff'}
                    onChange={(e) => setSiteInfo({ ...siteInfo, primaryForeground: e.target.value })}
                    className="w-20 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={siteInfo.primaryForeground || '#ffffff'}
                    onChange={(e) => setSiteInfo({ ...siteInfo, primaryForeground: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm font-medium mb-3">Anteprima</p>
                <div className="flex gap-4">
                  <div
                    className="px-6 py-3 rounded-lg text-white font-medium"
                    style={{ backgroundColor: siteInfo.primaryColor || '#ea580c', color: siteInfo.primaryForeground || '#ffffff' }}
                  >
                    Esempio Bottone
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: siteInfo.primaryColor || '#ea580c' }}
                    />
                    <span className="text-sm">Icona</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prenotazioni */}
        <TabsContent value="prenotazioni" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Gestione Prenotazioni
            </h2>
            <Button onClick={saveSiteInfo} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Impostazioni Prenotazioni</CardTitle>
              <CardDescription>Attiva o disattiva il sistema di prenotazioni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-medium">Prenotazioni Online</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Attiva o disattiva la possibilità per i clienti di prenotare online
                  </p>
                </div>
                <Button
                  variant={siteInfo.prenotazioniAttive ? "default" : "outline"}
                  onClick={() => setSiteInfo({ ...siteInfo, prenotazioniAttive: !siteInfo.prenotazioniAttive })}
                >
                  {siteInfo.prenotazioniAttive ? 'Attive' : 'Disattivate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Immagini */}
        <TabsContent value="images" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <ImageIcon className="w-6 h-6" />
              Gestione Immagini
            </h2>
            <div className="flex items-center gap-4">
              <select
                className="p-2 border rounded"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
              >
                <option value="hero">Hero</option>
                <option value="chi_siamo">Chi Siamo</option>
                <option value="gallery">Galleria</option>
                <option value="menu">Menu</option>
              </select>
              <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetImageForm(); setImageForm({ ...imageForm, sezione: selectedSection }) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Immagine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {imageForm.id ? 'Modifica Immagine' : 'Nuova Immagine'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Sezione</Label>
                      <select
                        className="w-full p-2 border rounded"
                        value={imageForm.sezione}
                        onChange={(e) => setImageForm({ ...imageForm, sezione: e.target.value })}
                      >
                        <option value="hero">Hero</option>
                        <option value="chi_siamo">Chi Siamo</option>
                        <option value="gallery">Galleria</option>
                        <option value="menu">Menu</option>
                      </select>
                    </div>
                    <div>
                      <Label>Titolo</Label>
                      <Input
                        value={imageForm.titolo}
                        onChange={(e) => setImageForm({ ...imageForm, titolo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Descrizione</Label>
                      <Textarea
                        value={imageForm.descrizione}
                        onChange={(e) => setImageForm({ ...imageForm, descrizione: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>URL Immagine *</Label>
                      <div className="flex gap-2">
                        <Input
                          value={imageForm.url}
                          onChange={(e) => setImageForm({ ...imageForm, url: e.target.value })}
                          placeholder="https://..."
                        />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            if (file.size > 5 * 1024 * 1024) {
                              alert('Il file supera la dimensione massima di 5MB')
                              return
                            }

                            try {
                              const formData = new FormData()
                              formData.append('file', file)

                              const response = await fetch('/api/admin/upload-image', {
                                method: 'POST',
                                body: formData
                              })

                              if (response.ok) {
                                const data = await response.json()
                                setImageForm({ ...imageForm, url: data.url })
                                alert('Immagine caricata con successo!')
                              } else {
                                const error = await response.json()
                                alert(error.error || 'Errore durante il caricamento')
                              }
                            } catch (error) {
                              console.error('Errore upload:', error)
                              alert('Errore durante il caricamento')
                            }
                            e.target.value = ''
                          }}
                          className="hidden"
                          id="upload-dialog"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('upload-dialog')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Carica
                        </Button>
                      </div>
                      {imageForm.url && (
                        <div className="mt-2">
                          <img
                            src={imageForm.url}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Ordine</Label>
                      <Input
                        type="number"
                        value={imageForm.ordine}
                        onChange={(e) => setImageForm({ ...imageForm, ordine: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="imgAttiva"
                        checked={imageForm.attiva}
                        onChange={(e) => setImageForm({ ...imageForm, attiva: e.target.checked })}
                      />
                      <Label htmlFor="imgAttiva">Immagine Attiva</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveImage}>
                        <Save className="w-4 h-4 mr-2" />
                        Salva
                      </Button>
                      <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                        Annulla
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Anteprima</TableHead>
                  <TableHead>Titolo</TableHead>
                  <TableHead>Sezione</TableHead>
                  <TableHead>Ordine</TableHead>
                  <TableHead>Attiva</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {images.map((img) => (
                  <TableRow key={img.id}>
                    <TableCell>
                      <img
                        src={img.url}
                        alt={img.titolo || img.sezione}
                        className="w-20 h-20 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{img.titolo || '-'}</TableCell>
                    <TableCell>{img.sezione}</TableCell>
                    <TableCell>{img.ordine}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant={img.attiva ? "default" : "outline"}
                        onClick={() => toggleImageActive(img.id, !img.attiva)}
                      >
                        {img.attiva ? 'Sì' : 'No'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editImage(img)}>
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteImage(img.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
