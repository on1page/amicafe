import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera un evento pubblico per slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const evento = await db.evento.findUnique({
      where: { slug }
    })

    if (!evento) {
      return NextResponse.json(
        { error: 'Evento non trovato' },
        { status: 404 }
      )
    }

    // Parse JSON fields
    const eventoConArray = {
      ...evento,
      incluso: evento.incluso ? JSON.parse(evento.incluso) : [],
      infoAggiuntive: evento.infoAggiuntive ? JSON.parse(evento.infoAggiuntive) : []
    }

    return NextResponse.json({ data: eventoConArray })
  } catch (error) {
    console.error('Errore nel recupero evento:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'evento' },
      { status: 500 }
    )
  }
}
