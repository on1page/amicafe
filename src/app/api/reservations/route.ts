import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST - Crea una nuova prenotazione
export async function POST(request: NextRequest) {
  console.log('[API /api/reservations] POST iniziato')

  try {
    const body = await request.json()
    console.log('[API /api/reservations] Body ricevuto:', body)

    const { nome, cognome, email, telefono, data, ora, persone, note, eventoId } = body

    if (!nome || !cognome || !email || !telefono || !data || !ora || !persone) {
      console.log('[API /api/reservations] Campi mancanti')
      return NextResponse.json(
        { error: 'Tutti i campi obbligatori devono essere compilati' },
        { status: 400 }
      )
    }

    console.log('[API /api/reservations] Creazione prenotazione...')

    const reservation = await db.reservation.create({
      data: {
        nome,
        cognome,
        email,
        telefono,
        data,
        ora,
        persone: parseInt(persone),
        note: note || null,
        eventoId: eventoId || null
      }
    })

    console.log('[API /api/reservations] Prenotazione creata:', {
      id: reservation.id,
      nome: reservation.nome,
      eventoId: reservation.eventoId
    })

    const responseData = {
      success: true,
      message: 'Prenotazione ricevuta con successo!',
      reservation: {
        id: reservation.id,
        nome: reservation.nome,
        cognome: reservation.cognome,
        email: reservation.email,
        telefono: reservation.telefono,
        data: reservation.data,
        ora: reservation.ora,
        persone: reservation.persone,
        eventoId: reservation.eventoId
      }
    }

    console.log('[API /api/reservations] Invio risposta')

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error('[API /api/reservations] Errore:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione della prenotazione', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
