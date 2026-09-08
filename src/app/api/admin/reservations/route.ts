import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera tutte le prenotazioni
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const stato = searchParams.get('stato')
    const dataFrom = searchParams.get('dataFrom')
    const dataTo = searchParams.get('dataTo')

    const where: any = {}

    if (stato) {
      where.stato = stato
    }

    if (dataFrom || dataTo) {
      where.data = {}
      if (dataFrom) where.data.gte = dataFrom
      if (dataTo) where.data.lte = dataTo
    }

    const reservations = await db.reservation.findMany({
      where,
      orderBy: [
        { data: 'asc' },
        { ora: 'asc' }
      ],
      include: {
        evento: {
          select: {
            id: true,
            titolo: true
          }
        }
      }
    })

    console.log('[Admin API] Prenotazioni recuperate:', JSON.stringify(reservations, null, 2))

    return NextResponse.json(reservations)
  } catch (error) {
    console.error('Errore nel recupero prenotazioni:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero delle prenotazioni' },
      { status: 500 }
    )
  }
}
