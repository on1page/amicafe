import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera un singolo banner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const banner = await db.bannerPubblicitario.findUnique({
      where: { id }
    })

    if (!banner) {
      return NextResponse.json(
        { error: 'Banner non trovato' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: banner })
  } catch (error) {
    console.error('Errore nel recupero banner:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero del banner' },
      { status: 500 }
    )
  }
}

// PUT - Aggiorna un banner
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const banner = await db.bannerPubblicitario.update({
      where: { id },
      data: {
        ...(body.tipo && { tipo: body.tipo }),
        ...(body.posizione && { posizione: body.posizione }),
        ...(body.sponsorNome && { sponsorNome: body.sponsorNome }),
        ...(body.sponsorLogo !== undefined && { sponsorLogo: body.sponsorLogo || null }),
        ...(body.sponsorUrl && { sponsorUrl: body.sponsorUrl }),
        ...(body.titolo !== undefined && { titolo: body.titolo || null }),
        ...(body.descrizione !== undefined && { descrizione: body.descrizione || null }),
        ...(body.ctaTesto !== undefined && { ctaTesto: body.ctaTesto || null }),
        ...(body.ctaUrl !== undefined && { ctaUrl: body.ctaUrl || null }),
        ...(body.immagineUrl !== undefined && { immagineUrl: body.immagineUrl || null }),
        ...(body.coloreSfondo !== undefined && { coloreSfondo: body.coloreSfondo || null }),
        ...(body.attivo !== undefined && { attivo: body.attivo }),
        ...(body.ordine !== undefined && { ordine: body.ordine }),
        ...(body.pagine !== undefined && { pagine: body.pagine ? JSON.stringify(body.pagine) : null })
      }
    })

    return NextResponse.json({ data: banner })
  } catch (error) {
    console.error('Errore nell\'aggiornamento banner:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento del banner' },
      { status: 500 }
    )
  }
}

// DELETE - Elimina un banner
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.bannerPubblicitario.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Errore nell\'eliminazione banner:', error)
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione del banner' },
      { status: 500 }
    )
  }
}
