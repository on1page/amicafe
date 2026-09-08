import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test connessione e struttura del database
    const tables = {
      reservations: false,
      companyData: false
    }

    try {
      await db.reservation.findFirst()
      tables.reservations = true
    } catch (e) {
      console.error('Tabella reservations non trovata:', e)
    }

    try {
      await db.companyData.findFirst()
      tables.companyData = true
    } catch (e) {
      console.error('Tabella companyData non trovata:', e)
    }

    return NextResponse.json({
      databaseConnected: true,
      tables,
      message: !tables.reservations || !tables.companyData 
        ? 'Alcune tabelle mancano. Esegui: bunx prisma db push' 
        : 'Tutte le tabelle sono presenti'
    })
  } catch (error) {
    return NextResponse.json({
      databaseConnected: false,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    }, { status: 500 })
  }
}