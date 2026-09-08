'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Calendar,
  Clock,
  Euro,
  Users,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  Sparkles,
  Upload,
  ZoomIn,
  ZoomOut,
  Move,
  Check,
  RotateCcw
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

interface Evento {
  id: string
  titolo: string
  slug: string
  descrizione: string
  descrizioneBreve: string
  immagineUrl: string | null
  data: string
  oraInizio: string
  oraFine: string
  prezzo: number
  etichettaPrezzo: string | null
  gratuito: boolean
  graditaPrenotazione: boolean
  capacita: number
  postiDisponibili: number
  location: string | null
  incluso: string | null
  infoAggiuntive: string | null
  inEvidenza: boolean
  nuovo: boolean
}

export default function AdminEventi() {
  const [eventi, setEventi] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image editor state
  const [imageEditorOpen, setImageEditorOpen] = useState(false)
  const [imageZoom, setImageZoom] = useState(1)
  const [imagePanX, setImagePanX] = useState(0)
  const [imagePanY, setImagePanY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageNaturalSize, setImageNaturalSize] = useState({ w: 0, h: 0 })
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorImageRef = useRef<HTMLImageElement>(null)

  const [formData, setFormData] = useState({
    titolo: '',
    descrizione: '',
    descrizioneBreve: '',
    immagineUrl: '',
    data: '',
    oraInizio: '',
    oraFine: '',
    prezzo: '',
    etichettaPrezzo: '',
    gratuito: false,
    graditaPrenotazione: false,
    capacita: '',
    postiDisponibili: '',
    location: '',
    incluso: '',
    infoAggiuntive: '',
    inEvidenza: false,
    nuovo: false
  })

  useEffect(() => {
    fetchEventi()
  }, [])

  async function fetchEventi() {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/eventi')
      const result = await response.json()
      setEventi(result.data || [])
    } catch (error) {
      console.error('Errore nel recupero eventi:', error)
    } finally {
      setLoading(false)
    }
  }

  function openDialog(evento?: Evento) {
    if (evento) {
      setEditingEvento(evento)
      setFormData({
        titolo: evento.titolo,
        descrizione: evento.descrizione,
        descrizioneBreve: evento.descrizioneBreve,
        immagineUrl: evento.immagineUrl || '',
        data: new Date(evento.data).toISOString().split('T')[0],
        oraInizio: evento.oraInizio,
        oraFine: evento.oraFine,
        prezzo: evento.prezzo.toString(),
        etichettaPrezzo: evento.etichettaPrezzo || '',
        gratuito: evento.gratuito,
        graditaPrenotazione: evento.graditaPrenotazione,
        capacita: evento.capacita.toString(),
        postiDisponibili: evento.postiDisponibili.toString(),
        location: evento.location || '',
        incluso: evento.incluso || '',
        infoAggiuntive: evento.infoAggiuntive || '',
        inEvidenza: evento.inEvidenza,
        nuovo: evento.nuovo
      })
    } else {
      setEditingEvento(null)
      setFormData({
        titolo: '',
        descrizione: '',
        descrizioneBreve: '',
        immagineUrl: '',
        data: '',
        oraInizio: '',
        oraFine: '',
        prezzo: '',
        etichettaPrezzo: '',
        gratuito: false,
        graditaPrenotazione: false,
        capacita: '',
        postiDisponibili: '',
        location: '',
        incluso: '',
        infoAggiuntive: '',
        inEvidenza: false,
        nuovo: false
      })
    }
    resetImageEditor()
    setDialogOpen(true)
  }

  function resetImageEditor() {
    setImageEditorOpen(false)
    setImageZoom(1)
    setImagePanX(0)
    setImagePanY(0)
    setIsDragging(false)
    setDragStart({ x: 0, y: 0 })
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formDataUpload
      })

      if (response.ok) {
        const result = await response.json()
        setFormData(prev => ({ ...prev, immagineUrl: result.url }))
        // Open image editor after upload
        resetImageEditor()
        setImageEditorOpen(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Errore durante il caricamento')
      }
    } catch (error) {
      console.error('Errore upload:', error)
      alert('Errore durante il caricamento dell\'immagine')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage() {
    setFormData(prev => ({ ...prev, immagineUrl: '' }))
    resetImageEditor()
  }

  function openImageEditor() {
    if (!formData.immagineUrl) return
    resetImageEditor()
    setImageEditorOpen(true)
  }

  // Image editor drag handlers
  const handleEditorMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePanX, y: e.clientY - imagePanY })
  }, [imagePanX, imagePanY])

  const handleEditorMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // Clamp pan to prevent image from going too far
    const container = editorContainerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      const scaledW = imageNaturalSize.w * (imageZoom / (rect.width / imageNaturalSize.w))
      const scaledH = imageNaturalSize.h * (imageZoom / (rect.height / imageNaturalSize.h))
      const maxPanX = Math.max(0, (scaledW - rect.width) / 2)
      const maxPanY = Math.max(0, (scaledH - rect.height) / 2)

      setImagePanX(Math.max(-maxPanX, Math.min(maxPanX, newX)))
      setImagePanY(Math.max(-maxPanY, Math.min(maxPanY, newY)))
    } else {
      setImagePanX(newX)
      setImagePanY(newY)
    }
  }, [isDragging, dragStart, imageZoom, imageNaturalSize])

  const handleEditorMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers for mobile
  const handleEditorTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - imagePanX, y: touch.clientY - imagePanY })
  }, [imagePanX, imagePanY])

  const handleEditorTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const touch = e.touches[0]
    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y

    const container = editorContainerRef.current
    if (container) {
      const rect = container.getBoundingClientRect()
      const maxPanX = Math.max(0, (imageNaturalSize.w * imageZoom - rect.width) / 2)
      const maxPanY = Math.max(0, (imageNaturalSize.h * imageZoom - rect.height) / 2)
      setImagePanX(Math.max(-maxPanX, Math.min(maxPanX, newX)))
      setImagePanY(Math.max(-maxPanY, Math.min(maxPanY, newY)))
    } else {
      setImagePanX(newX)
      setImagePanY(newY)
    }
  }, [isDragging, dragStart, imageZoom, imageNaturalSize])

  const handleEditorTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget
    setImageNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
  }

  function confirmImageEdit() {
    const img = editorImageRef.current
    const container = editorContainerRef.current
    if (!img || !container) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas size = container display size
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * 2 // 2x for retina quality
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Calculate how the image would be displayed at zoom=1 to fill the container
    const containerW = rect.width
    const containerH = rect.height
    const imgAspect = img.naturalWidth / img.naturalHeight
    const containerAspect = containerW / containerH

    let baseW: number, baseH: number
    if (imgAspect > containerAspect) {
      baseW = containerW
      baseH = containerW / imgAspect
    } else {
      baseH = containerH
      baseW = containerH * imgAspect
    }

    const scaledW = baseW * imageZoom
    const scaledH = baseH * imageZoom
    const drawX = (containerW - scaledW) / 2 + imagePanX
    const drawY = (containerH - scaledH) / 2 + imagePanY

    ctx.drawImage(img, drawX, drawY, scaledW, scaledH)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
    setFormData(prev => ({ ...prev, immagineUrl: dataUrl }))
    resetImageEditor()
  }

  function resetEditorPosition() {
    setImageZoom(1)
    setImagePanX(0)
    setImagePanY(0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const inclusoArray = formData.incluso
        .split('\n')
        .map(s => s.trim())
        .filter(s => s)

      const infoArray = formData.infoAggiuntive
        .split('\n')
        .map(s => s.trim())
        .filter(s => s)

      const payload = {
        ...formData,
        incluso: inclusoArray,
        infoAggiuntive: infoArray
      }

      const url = editingEvento
        ? `/api/admin/eventi/${editingEvento.id}`
        : '/api/admin/eventi'

      const method = editingEvento ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setDialogOpen(false)
        fetchEventi()
      } else {
        alert('Errore durante il salvataggio')
      }
    } catch (error) {
      console.error('Errore durante il salvataggio:', error)
      alert('Errore durante il salvataggio')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo evento?')) return

    try {
      const response = await fetch(`/api/admin/eventi/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchEventi()
      } else {
        alert('Errore durante l\'eliminazione')
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione:', error)
      alert('Errore durante l\'eliminazione')
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestione Eventi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Crea e gestisci gli eventi del ristorante
          </p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuovo Evento
        </Button>
      </div>

      {/* Tabella Eventi */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Evento</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Prezzo</TableHead>
                  <TableHead>Prenotazione</TableHead>
                  <TableHead>Evidenza</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventi.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                      Nessun evento presente. Clicca su &quot;Nuovo Evento&quot; per iniziare.
                    </TableCell>
                  </TableRow>
                ) : (
                  eventi.map((evento) => (
                    <TableRow key={evento.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-start gap-3">
                          {evento.immagineUrl ? (
                            <img
                              src={evento.immagineUrl}
                              alt={evento.titolo}
                              className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold">{evento.titolo}</span>
                              {evento.nuovo && (
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                                  Nuovo
                                </span>
                              )}
                              {evento.gratuito && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  Gratuito
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {evento.descrizioneBreve}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {formatDate(evento.data)}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {evento.oraInizio} - {evento.oraFine}
                        </div>
                      </TableCell>
                      <TableCell>
                        {evento.gratuito ? (
                          <span className="text-sm font-semibold text-green-600">Gratuito</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Euro className="w-3 h-3" />
                            <span className="font-semibold">€{evento.prezzo}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {evento.graditaPrenotazione ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                            Si
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {evento.inEvidenza && (
                          <Sparkles className="w-4 h-4 text-orange-500" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDialog(evento)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(evento.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Crea/Modifica Evento */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvento ? 'Modifica Evento' : 'Nuovo Evento'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titolo */}
            <div className="space-y-2">
              <Label htmlFor="titolo">Titolo *</Label>
              <Input
                id="titolo"
                value={formData.titolo}
                onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
                placeholder="Es: Serata Vini Toscani"
                required
              />
            </div>

            {/* Upload Immagine */}
            <div className="space-y-2">
              <Label>Immagine</Label>
              {formData.immagineUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border border-gray-200">
                    <img
                      src={formData.immagineUrl}
                      alt="Immagine evento"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        type="button"
                        onClick={openImageEditor}
                        className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        title="Modifica immagine"
                      >
                        <Move className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={removeImage}
                        className="p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
                        title="Rimuovi immagine"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={openImageEditor}
                    className="gap-1.5 text-xs"
                  >
                    <Move className="w-3.5 h-3.5" />
                    Regola posizione e zoom
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-28 border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6" />
                        <span className="text-sm font-medium">Carica da file</span>
                      </>
                    )}
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Image Editor Panel */}
            {imageEditorOpen && formData.immagineUrl && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-orange-100/80 border-b border-orange-200">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4 text-orange-700" />
                    <span className="text-sm font-semibold text-orange-800">Regola immagine</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetEditorPosition}
                    className="flex items-center gap-1 text-xs text-orange-700 hover:text-orange-900 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                </div>

                {/* Editor Canvas */}
                <div
                  ref={editorContainerRef}
                  className="relative w-full h-64 overflow-hidden bg-gray-900 cursor-grab active:cursor-grabbing select-none"
                  onMouseDown={handleEditorMouseDown}
                  onMouseMove={handleEditorMouseMove}
                  onMouseUp={handleEditorMouseUp}
                  onMouseLeave={handleEditorMouseUp}
                  onTouchStart={handleEditorTouchStart}
                  onTouchMove={handleEditorTouchMove}
                  onTouchEnd={handleEditorTouchEnd}
                >
                  <img
                    ref={editorImageRef}
                    src={formData.immagineUrl}
                    alt="Editor immagine"
                    onLoad={handleImageLoad}
                    className="absolute max-w-none pointer-events-none"
                    draggable={false}
                    style={{
                      width: `${imageNaturalSize.w ? (imageNaturalSize.w / imageNaturalSize.h) * 100 : 100}%`,
                      height: '100%',
                      objectFit: 'contain',
                      transform: `scale(${imageZoom}) translate(${imagePanX / imageZoom}px, ${imagePanY / imageZoom}px)`,
                      transformOrigin: 'center center',
                      left: '50%',
                      top: '50%',
                      marginLeft: `${imageNaturalSize.w ? -((imageNaturalSize.w / imageNaturalSize.h) * 50) : -50}%`,
                      marginTop: '-50%',
                    }}
                  />
                  {/* Grid overlay hint */}
                  {imageZoom === 1 && imagePanX === 0 && imagePanY === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                        <Move className="w-3 h-3" />
                        Trascina per spostare, usa lo zoom sotto
                      </div>
                    </div>
                  )}
                </div>

                {/* Zoom Controls */}
                <div className="px-4 py-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <Slider
                      value={[imageZoom]}
                      onValueChange={([val]) => setImageZoom(val)}
                      min={1}
                      max={3}
                      step={0.05}
                      className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-xs font-mono text-gray-500 w-10 text-right flex-shrink-0">
                      {imageZoom.toFixed(1)}x
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={confirmImageEdit}
                      className="flex-1 gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      Conferma ritaglio
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={resetImageEditor}
                    >
                      Annulla
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Data e Orari */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oraInizio">Ora Inizio *</Label>
                <Input
                  id="oraInizio"
                  type="time"
                  value={formData.oraInizio}
                  onChange={(e) => setFormData({ ...formData, oraInizio: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oraFine">Ora Fine *</Label>
                <Input
                  id="oraFine"
                  type="time"
                  value={formData.oraFine}
                  onChange={(e) => setFormData({ ...formData, oraFine: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Checkbox Gratuito + Gradita Prenotazione */}
            <div className="flex flex-wrap gap-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="gratuito"
                  checked={formData.gratuito}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, gratuito: checked === true })
                  }
                />
                <div>
                  <Label htmlFor="gratuito" className="cursor-pointer font-medium">
                    Evento gratuito
                  </Label>
                  <p className="text-xs text-gray-500">Nasconde il prezzo</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="graditaPrenotazione"
                  checked={formData.graditaPrenotazione}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, graditaPrenotazione: checked === true })
                  }
                />
                <div>
                  <Label htmlFor="graditaPrenotazione" className="cursor-pointer font-medium">
                    Gradita prenotazione
                  </Label>
                  <p className="text-xs text-gray-500">Consiglia di prenotare</p>
                </div>
              </div>
            </div>

            {/* Prezzo - visivo solo se non gratuito */}
            {!formData.gratuito && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prezzo">Prezzo *</Label>
                  <Input
                    id="prezzo"
                    type="number"
                    step="0.01"
                    value={formData.prezzo}
                    onChange={(e) => setFormData({ ...formData, prezzo: e.target.value })}
                    placeholder="85"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="etichettaPrezzo">Etichetta prezzo</Label>
                  <Input
                    id="etichettaPrezzo"
                    value={formData.etichettaPrezzo}
                    onChange={(e) => setFormData({ ...formData, etichettaPrezzo: e.target.value })}
                    placeholder="Es: A partire da, Per persona..."
                  />
                </div>
              </div>
            )}

            {/* Posti - visivo solo se gradita prenotazione */}
            {formData.graditaPrenotazione && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacita">Capacità Totale</Label>
                  <Input
                    id="capacita"
                    type="number"
                    value={formData.capacita}
                    onChange={(e) => setFormData({ ...formData, capacita: e.target.value })}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postiDisponibili">Posti Disponibili</Label>
                  <Input
                    id="postiDisponibili"
                    type="number"
                    value={formData.postiDisponibili}
                    onChange={(e) => setFormData({ ...formData, postiDisponibili: e.target.value })}
                    placeholder="20"
                  />
                </div>
              </div>
            )}

            {/* Descrizione Breve */}
            <div className="space-y-2">
              <Label htmlFor="descrizioneBreve">Descrizione Breve *</Label>
              <Textarea
                id="descrizioneBreve"
                value={formData.descrizioneBreve}
                onChange={(e) => setFormData({ ...formData, descrizioneBreve: e.target.value })}
                placeholder="Breve descrizione per la card evento..."
                rows={2}
                required
              />
            </div>

            {/* Descrizione Completa */}
            <div className="space-y-2">
              <Label htmlFor="descrizione">Descrizione Completa *</Label>
              <Textarea
                id="descrizione"
                value={formData.descrizione}
                onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                placeholder="Descrizione dettagliata dell'evento..."
                rows={5}
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Es: Sala Privata, Terrazza..."
              />
            </div>

            {/* Incluso */}
            <div className="space-y-2">
              <Label htmlFor="incluso">Cosa è incluso (una voce per riga)</Label>
              <Textarea
                id="incluso"
                value={formData.incluso}
                onChange={(e) => setFormData({ ...formData, incluso: e.target.value })}
                placeholder="Degustazione di 6 vini&#10;Selezione di formaggi&#10;Pane fatto in casa"
                rows={4}
              />
            </div>

            {/* Info Aggiuntive */}
            <div className="space-y-2">
              <Label htmlFor="infoAggiuntive">Info Aggiuntive (una voce per riga)</Label>
              <Textarea
                id="infoAggiuntive"
                value={formData.infoAggiuntive}
                onChange={(e) => setFormData({ ...formData, infoAggiuntive: e.target.value })}
                placeholder="Abbigliamento smart casual&#10;Parcheggio disponibile&#10;Menu vegetariano su richiesta"
                rows={4}
              />
            </div>

            {/* Toggle In Evidenza / Nuovo */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="inEvidenza"
                  checked={formData.inEvidenza}
                  onCheckedChange={(checked) => setFormData({ ...formData, inEvidenza: checked })}
                />
                <Label htmlFor="inEvidenza" className="cursor-pointer">
                  In evidenza
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="nuovo"
                  checked={formData.nuovo}
                  onCheckedChange={(checked) => setFormData({ ...formData, nuovo: checked })}
                />
                <Label htmlFor="nuovo" className="cursor-pointer">
                  Contrassegna come nuovo
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Annulla
              </Button>
              <Button type="submit" disabled={saving || uploading || imageEditorOpen}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Salvataggio...' : 'Salva Evento'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
