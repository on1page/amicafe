import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT - Aggiorna una prenotazione
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 16: params è una Promise, deve essere awaitata
  const { id } = await params

  console.log('PUT /api/admin/reservations/[id] - ID:', id)

  try {
    const body = await request.json()
    const { stato, note } = body

    console.log('PUT - Body ricevuto:', { id, stato, note })

    const reservation = await db.reservation.update({
      where: { id },
      data: {
        ...(stato && { stato }),
        ...(note !== undefined && { note })
      }
    })

    console.log('PUT - Prenotazione aggiornata:', reservation)
    return NextResponse.json(reservation)
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento prenotazione:', error)
    console.error('Dettagli errore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento della prenotazione',
        details: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
}

// DELETE - Elimina una prenotazione
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 16: params è una Promise, deve essere awaitata
  const { id } = await params

  console.log('DELETE /api/admin/reservations/[id] - ID:', id)

  try {
    await db.reservation.delete({
      where: { id }
    })

    console.log('DELETE - Prenotazione eliminata con successo:', id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Errore nell\'eliminazione prenotazione:', error)
    console.error('Dettagli errore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json(
      {
        error: 'Errore nell\'eliminazione della prenotazione',
        details: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    )
  }
}