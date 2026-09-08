import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera tutti gli eventi
export async function GET() {
  try {
    const eventi = await db.evento.findMany({
      orderBy: [
        { inEvidenza: 'desc' },
        { data: 'asc' }
      ]
    })

    return NextResponse.json({ data: eventi })
  } catch (error) {
    console.error('Errore nel recupero eventi:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero degli eventi' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo evento
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Genera slug dal titolo
    const slug = body.titolo
      .toLowerCase()
      .replace(/[^a-z0-9àèéìòù\s]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const evento = await db.evento.create({
      data: {
        titolo: body.titolo,
        slug,
        descrizione: body.descrizione,
        descrizioneBreve: body.descrizioneBreve,
        categoria: body.categoria,
        immagineUrl: body.immagineUrl || null,
        data: new Date(body.data),
        oraInizio: body.oraInizio,
        oraFine: body.oraFine,
        prezzo: parseFloat(body.prezzo),
        etichettaPrezzo: body.etichettaPrezzo || null,
        capacita: parseInt(body.capacita),
        postiDisponibili: parseInt(body.postiDisponibili),
        location: body.location || null,
        incluso: body.incluso ? JSON.stringify(body.incluso) : null,
        infoAggiuntive: body.infoAggiuntive ? JSON.stringify(body.infoAggiuntive) : null,
        stato: body.stato || 'available',
        inEvidenza: body.inEvidenza || false,
        nuovo: body.nuovo || false
      }
    })

    return NextResponse.json({ data: evento }, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione evento:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'evento' },
      { status: 500 }
    )
  }
}
