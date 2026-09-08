import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera un singolo evento
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const evento = await db.evento.findUnique({
      where: { id }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: evento })
  } catch (error) {
    console.error('Errore nel recupero evento:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'evento' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna un evento
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Se il titolo è cambiato, aggiorna anche lo slug
    let slug = undefined
    if (body.titolo) {
      slug = body.titolo
        .toLowerCase()
        .replace(/[^a-z0-9àèéìòù\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
    }

    const evento = await db.evento.update({
      where: { id },
      data: {
        ...(body.titolo && { titolo: body.titolo }),
        ...(slug && { slug }),
        ...(body.descrizione !== undefined && { descrizione: body.descrizione }),
        ...(body.descrizioneBreve !== undefined && { descrizioneBreve: body.descrizioneBreve }),
        ...(body.categoria && { categoria: body.categoria }),
        ...(body.immagineUrl !== undefined && { immagineUrl: body.immagineUrl || null }),
        ...(body.data && { data: new Date(body.data) }),
        ...(body.oraInizio && { oraInizio: body.oraInizio }),
        ...(body.oraFine && { oraFine: body.oraFine }),
        ...(body.prezzo !== undefined && { prezzo: parseFloat(body.prezzo) }),
        ...(body.etichettaPrezzo !== undefined && { etichettaPrezzo: body.etichettaPrezzo || null }),
        ...(body.capacita !== undefined && { capacita: parseInt(body.capacita) }),
        ...(body.postiDisponibili !== undefined && { postiDisponibili: parseInt(body.postiDisponibili) }),
        ...(body.location !== undefined && { location: body.location || null }),
        ...(body.incluso !== undefined && { incluso: body.incluso ? JSON.stringify(body.incluso) : null }),
        ...(body.infoAggiuntive !== undefined && { infoAggiuntive: body.infoAggiuntive ? JSON.stringify(body.infoAggiuntive) : null }),
        ...(body.stato && { stato: body.stato }),
        ...(body.inEvidenza !== undefined && { inEvidenza: body.inEvidenza }),
        ...(body.nuovo !== undefined && { nuovo: body.nuovo })
      }
    })

    return NextResponse.json({ data: evento })
  } catch (error) {
    console.error('Errore nell\'aggiornamento evento:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'evento' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un evento
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.evento.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Errore nell\'eliminazione evento:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'evento' },
      { status: 500 }
    )
  }
}
