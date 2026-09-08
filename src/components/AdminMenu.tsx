'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Plus, Pencil, Trash2, Save, X, Check, Upload, Move, ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Allergene {
  id: string
  nome: string
  icona?: string | null
}

interface Categoria {
  id: string
  nome: string
  ordine: number
  attiva: boolean
  _count?: { articoli: number }
}

interface Articolo {
  id: string
  nome: string
  descrizione: string | null
  categoriaId: string
  categoria: Categoria
  prezzo: number
  prezzoPromozionale: number | null
  scadenzaPromo: string | null
  eSurgelato: boolean
  eBestChoice: boolean
  attivo: boolean
  allergeni: Allergene[]
  immagineUrl: string | null
}

export default function AdminMenu() {
  const [categorie, setCategorie] = useState<Categoria[]>([])
  const [articoli, setArticoli] = useState<Articolo[]>([])
  const [allergeni, setAllergeni] = useState<Allergene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Categoria form
  const [categoriaForm, setCategoriaForm] = useState({ id: '', nome: '', ordine: 0, attiva: true })
  const [showCategoriaDialog, setShowCategoriaDialog] = useState(false)

  // Articolo form
  const [articoloForm, setArticoloForm] = useState({
    id: '',
    nome: '',
    descrizione: '',
    categoriaId: '',
    prezzo: '',
    prezzoPromozionale: '',
    scadenzaPromo: '',
    eSurgelato: false,
    eBestChoice: false,
    attivo: true,
    allergeni: [] as string[],
    immagineUrl: '',
    immagineAiGenerata: false
  })
  const [showArticoloDialog, setShowArticoloDialog] = useState(false)

  // Image upload state
  const [uploading, setUploading] = useState(false)
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

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [catRes, artRes, allRes] = await Promise.all([
        fetch('/api/admin/categorie'),
        fetch('/api/admin/articoli'),
        fetch('/api/admin/allergeni')
      ])

      if (catRes.ok) setCategorie(await catRes.json())
      if (artRes.ok) setArticoli(await artRes.json())
      if (allRes.ok) setAllergeni(await allRes.json())
    } catch (error) {
      console.error('Errore nel recupero dati:', error)
    } finally {
      setLoading(false)
    }
  }

  // --- Image editor functions ---

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
        setArticoloForm(prev => ({ ...prev, immagineUrl: result.url }))
        resetImageEditor()
        setImageEditorOpen(true)
      } else {
        const err = await response.json()
        alert(err.error || 'Errore durante il caricamento')
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
    setArticoloForm(prev => ({ ...prev, immagineUrl: '', immagineAiGenerata: false }))
    resetImageEditor()
  }

  function openImageEditor() {
    if (!articoloForm.immagineUrl) return
    resetImageEditor()
    setImageEditorOpen(true)
  }

  const handleEditorMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - imagePanX, y: e.clientY - imagePanY })
  }, [imagePanX, imagePanY])

  const handleEditorMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y
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

  const handleEditorMouseUp = useCallback(() => { setIsDragging(false) }, [])

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

  const handleEditorTouchEnd = useCallback(() => { setIsDragging(false) }, [])

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

    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * 2
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

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
    setArticoloForm(prev => ({ ...prev, immagineUrl: dataUrl }))
    resetImageEditor()
  }

  function resetEditorPosition() {
    setImageZoom(1)
    setImagePanX(0)
    setImagePanY(0)
  }

  // --- Categorie CRUD ---

  async function saveCategoria() {
    setError(null)
    const url = categoriaForm.id
      ? `/api/admin/categorie/${categoriaForm.id}`
      : '/api/admin/categorie'
    const method = categoriaForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoriaForm)
      })

      if (response.ok) {
        setShowCategoriaDialog(false)
        setCategoriaForm({ id: '', nome: '', ordine: 0, attiva: true })
        fetchData()
        alert('Categoria salvata con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Errore nel salvataggio della categoria')
        alert(`Errore: ${errorData.error || 'Errore nel salvataggio della categoria'}`)
      }
    } catch (error) {
      console.error('Errore salvataggio categoria:', error)
      const errorMsg = 'Errore di connessione. Verifica che il server sia attivo.'
      setError(errorMsg)
      alert(errorMsg)
    }
  }

  async function deleteCategoria(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa categoria?')) return

    setError(null)
    try {
      const response = await fetch(`/api/admin/categorie/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
        alert('Categoria eliminata con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Errore nell\'eliminazione della categoria')
        alert(`Errore: ${errorData.error || 'Errore nell\'eliminazione della categoria'}`)
      }
    } catch (error) {
      console.error('Errore eliminazione categoria:', error)
      const errorMsg = 'Errore di connessione. Verifica che il server sia attivo.'
      setError(errorMsg)
      alert(errorMsg)
    }
  }

  function editCategoria(cat: Categoria) {
    setCategoriaForm({
      id: cat.id,
      nome: cat.nome,
      ordine: cat.ordine,
      attiva: cat.attiva
    })
    setShowCategoriaDialog(true)
  }

  // --- Articoli CRUD ---

  async function saveArticolo() {
    if (imageEditorOpen) return
    setError(null)
    const url = articoloForm.id
      ? `/api/admin/articoli/${articoloForm.id}`
      : '/api/admin/articoli'
    const method = articoloForm.id ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articoloForm)
      })

      if (response.ok) {
        setShowArticoloDialog(false)
        resetArticoloForm()
        fetchData()
        alert('Articolo salvato con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Errore nel salvataggio dell\'articolo')
        alert(`Errore: ${errorData.error || 'Errore nel salvataggio dell\'articolo'}`)
      }
    } catch (error) {
      console.error('Errore salvataggio articolo:', error)
      const errorMsg = 'Errore di connessione. Verifica che il server sia attivo.'
      setError(errorMsg)
      alert(errorMsg)
    }
  }

  async function deleteArticolo(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questo articolo?')) return

    setError(null)
    try {
      const response = await fetch(`/api/admin/articoli/${id}`, { method: 'DELETE' })
      if (response.ok) {
        fetchData()
        alert('Articolo eliminato con successo!')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Errore nell\'eliminazione dell\'articolo')
        alert(`Errore: ${errorData.error || 'Errore nell\'eliminazione dell\'articolo'}`)
      }
    } catch (error) {
      console.error('Errore eliminazione articolo:', error)
      const errorMsg = 'Errore di connessione. Verifica che il server sia attivo.'
      setError(errorMsg)
      alert(errorMsg)
    }
  }

  function editArticolo(art: Articolo) {
    setArticoloForm({
      id: art.id,
      nome: art.nome,
      descrizione: art.descrizione || '',
      categoriaId: art.categoriaId,
      prezzo: art.prezzo.toString(),
      prezzoPromozionale: art.prezzoPromozionale?.toString() || '',
      scadenzaPromo: art.scadenzaPromo?.split('T')[0] || '',
      eSurgelato: art.eSurgelato,
      eBestChoice: art.eBestChoice,
      attivo: art.attivo,
      allergeni: art.allergeni.map(a => a.id),
      immagineUrl: art.immagineUrl || '',
      immagineAiGenerata: (art as any).immagineAiGenerata || false
    })
    resetImageEditor()
    setShowArticoloDialog(true)
  }

  function resetArticoloForm() {
    setArticoloForm({
      id: '',
      nome: '',
      descrizione: '',
      categoriaId: '',
      prezzo: '',
      prezzoPromozionale: '',
      scadenzaPromo: '',
      eSurgelato: false,
      eBestChoice: false,
      attivo: true,
      allergeni: [],
      immagineUrl: '',
      immagineAiGenerata: false
    })
    resetImageEditor()
  }

  function toggleAllergene(allergeneId: string) {
    setArticoloForm(prev => ({
      ...prev,
      allergeni: prev.allergeni.includes(allergeneId)
        ? prev.allergeni.filter(id => id !== allergeneId)
        : [...prev.allergeni, allergeneId]
    }))
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Errore: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError(null)}
          >
            <span className="text-red-700 font-bold">×</span>
          </button>
        </div>
      )}

      <Tabs defaultValue="categorie">
        <TabsList>
          <TabsTrigger value="categorie">Categorie</TabsTrigger>
          <TabsTrigger value="articoli">Articoli</TabsTrigger>
          <TabsTrigger value="allergeni">Allergeni</TabsTrigger>
        </TabsList>

        {/* Categorie */}
        <TabsContent value="categorie" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestione Categorie</h2>
            <Dialog open={showCategoriaDialog} onOpenChange={setShowCategoriaDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { setCategoriaForm({ id: '', nome: '', ordine: 0, attiva: true }) }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {categoriaForm.id ? 'Modifica Categoria' : 'Nuova Categoria'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={categoriaForm.nome}
                      onChange={(e) => setCategoriaForm({ ...categoriaForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ordine</Label>
                    <Input
                      type="number"
                      value={categoriaForm.ordine}
                      onChange={(e) => setCategoriaForm({ ...categoriaForm, ordine: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="attiva"
                      checked={categoriaForm.attiva}
                      onCheckedChange={(checked) => setCategoriaForm({ ...categoriaForm, attiva: checked as boolean })}
                    />
                    <Label htmlFor="attiva">Attiva</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveCategoria}>
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </Button>
                    <Button variant="outline" onClick={() => setShowCategoriaDialog(false)}>
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Ordine</TableHead>
                  <TableHead>Articoli</TableHead>
                  <TableHead>Attiva</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorie.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>{cat.nome}</TableCell>
                    <TableCell>{cat.ordine}</TableCell>
                    <TableCell>{cat._count?.articoli || 0}</TableCell>
                    <TableCell>{cat.attiva ? <Check className="text-green-600" /> : <X className="text-red-600" />}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editCategoria(cat)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteCategoria(cat.id)}>
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

        {/* Articoli */}
        <TabsContent value="articoli" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestione Articoli</h2>
            <Button onClick={() => {
              resetArticoloForm()
              setShowArticoloDialog(true)
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Nuovo Articolo
            </Button>
            <Dialog open={showArticoloDialog} onOpenChange={(open) => {
              if (!open && !imageEditorOpen) {
                setShowArticoloDialog(false)
              }
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {articoloForm.id ? 'Modifica Articolo' : 'Nuovo Articolo'}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input
                      value={articoloForm.nome}
                      onChange={(e) => setArticoloForm({ ...articoloForm, nome: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Descrizione</Label>
                    <Textarea
                      value={articoloForm.descrizione}
                      onChange={(e) => setArticoloForm({ ...articoloForm, descrizione: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Categoria *</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={articoloForm.categoriaId}
                      onChange={(e) => setArticoloForm({ ...articoloForm, categoriaId: e.target.value })}
                    >
                      <option value="">Seleziona categoria</option>
                      {categorie.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Prezzo (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={articoloForm.prezzo}
                        onChange={(e) => setArticoloForm({ ...articoloForm, prezzo: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Prezzo Promo (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={articoloForm.prezzoPromozionale}
                        onChange={(e) => setArticoloForm({ ...articoloForm, prezzoPromozionale: e.target.value })}
                      />
                    </div>
                  </div>
                  {articoloForm.prezzoPromozionale && (
                    <div>
                      <Label>Scadenza Promo</Label>
                      <Input
                        type="date"
                        value={articoloForm.scadenzaPromo}
                        onChange={(e) => setArticoloForm({ ...articoloForm, scadenzaPromo: e.target.value })}
                      />
                    </div>
                  )}

                  {/* Immagine - Upload + Editor */}
                  <div className="space-y-2">
                    <Label>Immagine</Label>
                    {articoloForm.immagineUrl ? (
                      <div className="space-y-3">
                        <div className="relative rounded-xl overflow-hidden border border-gray-200">
                          <img
                            src={articoloForm.immagineUrl}
                            alt="Immagine articolo"
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
                          disabled={uploading}
                          className={`w-full h-28 border-2 border-dashed ${uploading ? 'border-gray-200 opacity-50' : 'border-gray-300 hover:border-orange-400'} rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 transition-colors cursor-pointer disabled:cursor-not-allowed`}
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
                  {imageEditorOpen && articoloForm.immagineUrl && (
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
                          src={articoloForm.immagineUrl}
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
                        {imageZoom === 1 && imagePanX === 0 && imagePanY === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1.5">
                              <Move className="w-3 h-3" />
                              Trascina per spostare, usa lo zoom sotto
                            </div>
                          </div>
                        )}
                      </div>

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

                  <div className="space-y-2">
                    <Label>Flag Speciali</Label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={articoloForm.eBestChoice}
                          onCheckedChange={(checked) => setArticoloForm({ ...articoloForm, eBestChoice: checked as boolean })}
                        />
                        <span>Best Choice</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox
                          checked={articoloForm.eSurgelato}
                          onCheckedChange={(checked) => setArticoloForm({ ...articoloForm, eSurgelato: checked as boolean })}
                        />
                        <span>Prodotto Surgelato</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Allergeni</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                      {allergeni.map((all) => (
                        <label key={all.id} className="flex items-center gap-2 p-2 border rounded">
                          <Checkbox
                            checked={articoloForm.allergeni.includes(all.id)}
                            onCheckedChange={() => toggleAllergene(all.id)}
                          />
                          <span className="text-sm">{all.icona} {all.nome}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveArticolo} disabled={imageEditorOpen || uploading}>
                      <Save className="w-4 h-4 mr-2" />
                      Salva
                    </Button>
                    <Button variant="outline" onClick={() => { if (!imageEditorOpen) setShowArticoloDialog(false) }} disabled={imageEditorOpen || uploading}>
                      Annulla
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Immagine</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prezzo</TableHead>
                  <TableHead>Promo</TableHead>
                  <TableHead>Best Choice</TableHead>
                  <TableHead>Attivo</TableHead>
                  <TableHead>Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articoli.map((art) => (
                  <TableRow key={art.id}>
                    <TableCell>
                      {art.immagineUrl ? (
                        <img src={art.immagineUrl} alt={art.nome} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Nessuna</div>
                      )}
                    </TableCell>
                    <TableCell>{art.nome}</TableCell>
                    <TableCell>{art.categoria.nome}</TableCell>
                    <TableCell>€{art.prezzo.toFixed(2)}</TableCell>
                    <TableCell>
                      {art.prezzoPromozionale ? `€${art.prezzoPromozionale.toFixed(2)}` : '-'}
                    </TableCell>
                    <TableCell>
                      {art.eBestChoice ? <Check className="text-green-600" /> : <X className="text-gray-400" />}
                    </TableCell>
                    <TableCell>
                      {art.attivo ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => editArticolo(art)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteArticolo(art.id)}>
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

        {/* Allergeni */}
        <TabsContent value="allergeni" className="space-y-4">
          <h2 className="text-2xl font-bold">Lista Allergeni (Normativa UE)</h2>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Icona</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrizione</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allergeni.map((all) => (
                  <TableRow key={all.id}>
                    <TableCell>{all.icona}</TableCell>
                    <TableCell>{all.nome}</TableCell>
                    <TableCell>{all.descrizione || '-'}</TableCell>
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
