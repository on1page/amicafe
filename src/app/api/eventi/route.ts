import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseJsonField(field: unknown): string[] | null {
  if (field === null || field === undefined) return null
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field)
      if (Array.isArray(parsed)) return parsed
      // Se è una stringa con newlines, splitta
      return field.split('\n').map(s => s.trim()).filter(Boolean)
    } catch {
      // Non è JSON valido, prova a splittare per newlines
      return field.split('\n').map(s => s.trim()).filter(Boolean)
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  try {
    const eventi = await db.evento.findMany({
      orderBy: [
        { inEvidenza: 'desc' },
        { data: 'asc' }
      ]
    })

    // Filtra eventi passati
    const oggi = new Date()
    oggi.setHours(0, 0, 0, 0)

    // Calcola posti rimanenti per ogni evento con capacità limitata
    const eventiConPosti = await Promise.all(
      eventi.map(async (evento) => {
        let postiRimanenti: number | null = null

        if (evento.capacita > 0) {
          // Somma il numero di persone delle prenotazioni confermate per questo evento
          const prenotazioniConfermate = await db.reservation.findMany({
            where: {
              eventoId: evento.id,
              stato: 'confirmed'
            },
            select: {
              persone: true
            }
          })

          const totalePrenotati = prenotazioniConfermate.reduce((sum, p) => sum + (p.persone || 0), 0)
          postiRimanenti = Math.max(0, evento.capacita - totalePrenotati)
        }

        return {
          ...evento,
          postiRimanenti,
          incluso: parseJsonField(evento.incluso),
          infoAggiuntive: parseJsonField(evento.infoAggiuntive),
        }
      })
    )

    const eventiFuturi = eventiConPosti.filter(e => {
      const dataEvento = new Date(e.data)
      return dataEvento >= oggi
    })

    return NextResponse.json({ data: eventiFuturi })
  } catch (error) {
    console.error('Errore nel recupero eventi pubblici:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli eventi' },
      { status: 500 }
    )
  }
}
