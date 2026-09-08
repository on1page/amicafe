import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET - Recupera banner pubblicitari
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagina = searchParams.get('pagina') || 'eventi'
    const tipo = searchParams.get('tipo') // horizontal, vertical
    const posizione = searchParams.get('posizione') // top, bottom, left, right, inline

    const where: any = {
      attivo: true
    }

    // Filtra per pagina
    const banners = await db.bannerPubblicitario.findMany({
      where,
      orderBy: { ordine: 'asc' }
    })

    // Filtra client-side per pagina
    const bannersFiltrati = banners.filter(banner => {
      if (!banner.pagine) return true
      const pagine = JSON.parse(banner.pagine)
      return pagine.includes(pagina) || pagine.includes('all')
    })

    // Filtra opzionalmente per tipo e posizione
    let risultati = bannersFiltrati
    if (tipo) {
      risultati = risultati.filter(b => b.tipo === tipo)
    }
    if (posizione) {
      risultati = risultati.filter(b => b.posizione === posizione)
    }

    return NextResponse.json({ data: risultati })
  } catch (error) {
    console.error('Errore nel recupero banner:', error)
    return NextResponse.json(
      { error: 'Errore nel recupero dei banner' },
      { status: 500 }
    )
  }
}
