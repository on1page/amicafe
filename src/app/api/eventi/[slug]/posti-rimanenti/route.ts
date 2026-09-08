import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Calcola i posti rimanenti per un evento
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const eventoSlug = params.slug

    // Recupera l'evento per slug
    const evento = await db.evento.findUnique({
      where: { slug: eventoSlug }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    // Se ha capacità, calcola i posti rimanenti sommando le persone delle prenotazioni
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
      const rimanenti = Math.max(0, evento.capacita - totalePrenotati)

      return NextResponse.json({
        capacita: evento.capacita,
        prenotati: totalePrenotati,
        rimanenti: rimanenti,
        postiLimitati: true
      })
    }

    // Se non ha capacità, non ci sono posti limitati
    return NextResponse.json({
      capacita: 0,
      prenotati: 0,
      rimanenti: null,
      postiLimitati: false
    })
  } catch (error) {
    console.error('Errore nel calcolo posti rimanenti:', error)
    return NextResponse.json(
      { error: 'Errore nel calcolo dei posti rimanenti' },
      { status: 500 }
    )
  }
}