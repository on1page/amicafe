'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Check, X, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Reservation {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string
  data: string
  ora: string
  persone: number
  note?: string | null
  stato: string
  eventoId?: string | null
  evento?: { titolo: string } | null
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  confirmed: number
  cancelled: number
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStato, setFilterStato] = useState('all')
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, confirmed: 0, cancelled: 0 })
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set())
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [prenotazioniAttive, setPrenotazioniAttive] = useState(true)
  const [updatingPrenotazioni, setUpdatingPrenotazioni] = useState(false)

  useEffect(() => {
    fetchData()
    fetchPrenotazioniAttive()
  }, [filterStato])

  async function fetchPrenotazioniAttive() {
    try {
      const response = await fetch('/api/admin/site-info')
      if (response.ok) {
        const data = await response.json()
        setPrenotazioniAttive(data.prenotazioniAttive ?? true)
      }
    } catch (error) {
      console.error('Errore nel recupero stato prenotazioni:', error)
    }
  }

  async function togglePrenotazioniAttive() {
    setUpdatingPrenotazioni(true)
    try {
      const newValue = !prenotazioniAttive
      const response = await fetch('/api/admin/site-info', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prenotazioniAttive: newValue })
      })

      if (response.ok) {
        setPrenotazioniAttive(newValue)
      } else {
        const errorData = await response.json()
        alert(`Errore: ${errorData.error || 'Impossibile aggiornare lo stato delle prenotazioni'}`)
      }
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
      alert('Errore di connessione. Riprova.')
    } finally {
      setUpdatingPrenotazioni(false)
    }
  }

  async function fetchData() {
    setLoading(true)
    try {
      const url = filterStato === 'all'
        ? '/api/admin/reservations'
        : `/api/admin/reservations?stato=${filterStato}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setReservations(data)

        // Calcola le statistiche
        if (filterStato === 'all') {
          const newStats: Stats = {
            total: data.length,
            pending: data.filter((r: Reservation) => r.stato === 'pending').length,
            confirmed: data.filter((r: Reservation) => r.stato === 'confirmed').length,
            cancelled: data.filter((r: Reservation) => r.stato === 'cancelled').length
          }
          setStats(newStats)
        }
      }
    } catch (error) {
      console.error('Errore nel recupero prenotazioni:', error)
    } finally {
      setLoading(false)
    }
  }

  // Funzione per formattare il numero di telefono con prefisso internazionale
  function formatPhoneNumber(phone: string): string {
    // Rimuove tutti i caratteri non numerici
    let cleaned = phone.replace(/\D/g, '')

    // Se non inizia con 39 (prefisso Italia), lo aggiunge
    if (!cleaned.startsWith('39')) {
      cleaned = '39' + cleaned
    }

    return cleaned
  }

  // Funzione per creare il messaggio in italiano informale
  function createMessage(reservation: Reservation, status: string): string {
    const dataFormattata = new Date(reservation.data).toLocaleDateString('it-IT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    })

    const nomeCliente = reservation.nome

    if (status === 'confirmed') {
      return `Ciao ${nomeCliente}! 👋

Ottima notizia! La tua prenotazione è confermata! 🎉

📅 Data: ${dataFormattata}
🕐 Ora: ${reservation.ora}
👥 Persone: ${reservation.persone}
${reservation.note ? `📝 Note: ${reservation.note}` : ''}

Ti aspettiamo presto da noi! A presto! 😊`
    } else {
      return `Ciao ${nomeCliente}! 👋

Mi dispiace comunicarti che la tua prenotazione è stata cancellata.

📅 Data: ${dataFormattata}
🕐 Ora: ${reservation.ora}
👥 Persone: ${reservation.persone}

Se vuoi prenotare per un'altra data, contattaci pure! Ci piacerebbe averti con noi. A presto! 😊`
    }
  }

  // Funzione per aprire WhatsApp con il messaggio precompilato
  function openCommunicationChannels(reservation: Reservation, status: string) {
    const message = createMessage(reservation, status)
    const encodedMessage = encodeURIComponent(message)

    // Formatta il numero di telefono per WhatsApp
    const formattedPhone = formatPhoneNumber(reservation.telefono)

    // Apre WhatsApp
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
    window.open(whatsappUrl, '_blank')
  }

  async function updateStatus(id: string, stato: string) {
    setUpdatingIds(prev => new Set([...prev, id]))
    try {
      // Recupera i dettagli della prenotazione prima dell'aggiornamento
      const reservation = reservations.find(r => r.id === id)

      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stato })
      })

      if (response.ok) {
        fetchData()

        // Se abbiamo i dettagli della prenotazione, apri i canali di comunicazione
        if (reservation && (stato === 'confirmed' || stato === 'cancelled')) {
          openCommunicationChannels(reservation, stato)
        }
      } else {
        const errorData = await response.json()
        alert(`Errore: ${errorData.error || 'Impossibile aggiornare lo stato'}`)
      }
    } catch (error) {
      console.error('Errore aggiornamento stato:', error)
      alert('Errore di connessione. Riprova.')
    } finally {
      setUpdatingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  async function deleteReservation(id: string) {
    if (!confirm('Sei sicuro di voler eliminare questa prenotazione?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/reservations/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchData()
        alert('Prenotazione eliminata con successo!')
      } else {
        const errorData = await response.json()
        alert(`Errore: ${errorData.error || 'Impossibile eliminare la prenotazione'}`)
      }
    } catch (error) {
      console.error('Errore eliminazione prenotazione:', error)
      alert('Errore di connessione. Riprova.')
    } finally {
      setDeletingId(null)
    }
  }

  function getStatoBadge(stato: string) {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    const labels = {
      pending: 'In Attesa',
      confirmed: 'Confermata',
      cancelled: 'Cancellata'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[stato as keyof typeof badges] || badges.pending}`}>
        {labels[stato as keyof typeof labels] || stato}
      </span>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header con contatore e switch */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Prenotazioni</h2>
          {filterStato === 'all' && (
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-600">Totale:</span>
                <span className="font-bold text-gray-900">{stats.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-yellow-600">In attesa:</span>
                <span className="font-bold text-yellow-700">{stats.pending}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-green-600">Confermate:</span>
                <span className="font-bold text-green-700">{stats.confirmed}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-red-600">Cancellate:</span>
                <span className="font-bold text-red-700">{stats.cancelled}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Switch Prenotazioni Attive */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2">
              {prenotazioniAttive ? (
                <ToggleRight className="w-5 h-5 text-green-600" />
              ) : (
                <ToggleLeft className="w-5 h-5 text-gray-400" />
              )}
              <Label className="text-sm font-medium cursor-pointer">Pulsante Prenota</Label>
            </div>
            <Switch
              checked={prenotazioniAttive}
              onCheckedChange={togglePrenotazioniAttive}
              disabled={updatingPrenotazioni}
            />
          </div>
          {/* Filtro Stato */}
          <div className="flex items-center gap-2">
            <Label>Stato:</Label>
            <Select value={filterStato} onValueChange={setFilterStato}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                <SelectItem value="pending">In Attesa</SelectItem>
                <SelectItem value="confirmed">Confermate</SelectItem>
                <SelectItem value="cancelled">Cancellate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Ora</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Contatti</TableHead>
                <TableHead>Persone</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Nessuna prenotazione trovata
                  </TableCell>
                </TableRow>
              ) : (
                reservations.map((res) => (
                  <TableRow key={res.id}>
                    <TableCell className="font-medium">
                      {new Date(res.data).toLocaleDateString('it-IT')}
                    </TableCell>
                    <TableCell>{res.ora}</TableCell>
                    <TableCell>
                      {res.evento?.titolo ? (
                        <span className="text-sm font-medium text-primary">{res.evento.titolo}</span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{res.nome} {res.cognome}</div>
                        {res.note && (
                          <div className="text-sm text-gray-500 mt-1">{res.note}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{res.email}</div>
                        <div>{res.telefono}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        {res.persone}
                      </div>
                    </TableCell>
                    <TableCell>{getStatoBadge(res.stato)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {res.stato === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus(res.id, 'confirmed')}
                              disabled={updatingIds.has(res.id)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                            >
                              {updatingIds.has(res.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => updateStatus(res.id, 'cancelled')}
                              disabled={updatingIds.has(res.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                            >
                              {updatingIds.has(res.id) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <X className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteReservation(res.id)}
                          disabled={deletingId === res.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          {deletingId === res.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-500">
        <p>ℹ️ Le prenotazioni in attesa possono essere confermate o cancellate.</p>
      </div>
    </div>
  )
}
