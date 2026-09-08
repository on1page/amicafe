import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Conta i record in ogni tabella
    const counts = {
      allergeni: await db.allergene.count(),
      categorie: await db.categoria.count(),
      articoli: await db.articolo.count(),
      reservations: await db.reservation.count(),
      companyData: await db.companyData.count(),
      siteInfo: await db.siteInfo.count(),
      footerInfo: await db.footerInfo.count()
    }

    // Recupera le prenotazioni se esistono
    let reservations: any[] = []
    if (counts.reservations > 0) {
      reservations = await db.reservation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    }

    // Recupera i dati aziendali se esistono
    let companyData: any = null
    if (counts.companyData > 0) {
      companyData = await db.companyData.findFirst()
    }

    return NextResponse.json({
      databaseConnected: true,
      counts,
      reservationsPreview: reservations,
      companyData: companyData ? {
        ragioneSociale: companyData.ragioneSociale,
        partitaIva: companyData.partitaIva
      } : null,
      message: counts.reservations > 0 
        ? `Trovate ${counts.reservations} prenotazioni` 
        : 'Nessuna prenotazione trovata'
    })
  } catch (error) {
    return NextResponse.json({
      databaseConnected: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}