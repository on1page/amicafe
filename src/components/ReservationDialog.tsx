'use client'

import { useState } from 'react'
import { X, Calendar, Clock, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReservationDialogProps {
  onClose: () => void
  eventoId?: string
  eventoData?: string
  eventoOra?: string
  eventoTitolo?: string
  onSuccess?: () => void
}

export default function ReservationDialog({
  onClose,
  eventoId,
  eventoData,
  eventoOra,
  eventoTitolo,
  onSuccess
}: ReservationDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    data: eventoData || '',
    ora: eventoOra || '',
    persone: '2'
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // Prepara il payload con eventoId se presente
    const payload = {
      ...formData,
      ...(eventoId ? { eventoId } : {})
    }

    console.log('[ReservationDialog] Invio prenotazione:', payload)

    // Invia la prenotazione al backend
    fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async response => {
        console.log('[ReservationDialog] Status:', response.status)
        const text = await response.text()
        console.log('[ReservationDialog] Response text:', text)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text}`)
        }

        return JSON.parse(text)
      })
      .then(data => {
        console.log('[ReservationDialog] Response data:', data)
        if (data.success) {
          alert(`Grazie ${formData.nome}! La tua prenotazione è stata confermata.\n\nData: ${formData.data}\nOra: ${formData.ora}\nPersone: ${formData.persone}\n${eventoTitolo ? `Evento: ${eventoTitolo}\n` : ''}Ti contatteremo presto per confermare.`)
          onSuccess?.()
          onClose()
        } else {
          alert(`Errore: ${data.error || 'Impossibile completare la prenotazione'}`)
        }
      })
      .catch(error => {
        console.error('[ReservationDialog] Errore:', error)
        alert(`Errore di connessione: ${error.message}`)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto relative m-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{eventoTitolo ? `Prenotazione: ${eventoTitolo}` : 'Prenota un Tavolo'}</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="cognome">Cognome *</Label>
              <Input
                id="cognome"
                value={formData.cognome}
                onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="telefono">Telefono *</Label>
              <Input
                id="telefono"
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={!!eventoData}
              />
              {eventoData && (
                <p className="text-xs text-gray-500 mt-1">Data dell'evento</p>
              )}
            </div>
            <div>
              <Label htmlFor="ora">Ora *</Label>
              <Input
                id="ora"
                type="time"
                value={formData.ora}
                onChange={(e) => setFormData({ ...formData, ora: e.target.value })}
                required
                disabled={!!eventoOra}
              />
              {eventoOra && (
                <p className="text-xs text-gray-500 mt-1">Ora dell'evento</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="persone">Numero di Persone *</Label>
            <div className="flex items-center gap-4">
              <Users className="w-5 h-5 text-gray-500" />
              <select
                id="persone"
                value={formData.persone}
                onChange={(e) => setFormData({ ...formData, persone: e.target.value })}
                className="flex-1 p-2 border rounded"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'persone'}</option>
                ))}
                <option value="10+">10+ persone</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? 'Invio in corso...' : 'Conferma Prenotazione'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Ti confermeremo la prenotazione via email o telefono
          </p>
        </form>
      </div>
    </div>
  )
}
