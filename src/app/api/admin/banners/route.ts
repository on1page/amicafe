import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera tutti i banner
export async function GET() {
  try {
    const banners = await db.bannerPubblicitario.findMany({
      orderBy: { ordine: 'asc' }
    })

    return NextResponse.json({ data: banners })
  } catch (error) {
    console.error('Errore nel recupero banner:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei banner' },
      { status: 500 }
    )
  }
}

// POST - Crea un nuovo banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const banner = await db.bannerPubblicitario.create({
      data: {
        tipo: body.tipo,
        posizione: body.posizione,
        sponsorNome: body.sponsorNome,
        sponsorLogo: body.sponsorLogo || null,
        sponsorUrl: body.sponsorUrl,
        titolo: body.titolo || null,
        descrizione: body.descrizione || null,
        ctaTesto: body.ctaTesto || null,
        ctaUrl: body.ctaUrl || null,
        immagineUrl: body.immagineUrl || null,
        coloreSfondo: body.coloreSfondo || null,
        attivo: body.attivo !== undefined ? body.attivo : true,
        ordine: body.ordine || 0,
        pagine: body.pagine ? JSON.stringify(body.pagine) : null
      }
    })

    return NextResponse.json({ data: banner }, { status: 201 })
  } catch (error) {
    console.error('Errore nella creazione banner:', error)
    return NextResponse.json(
      { error: 'Errore nella creazione del banner' },
      { status: 500 }
    )
  }
}
