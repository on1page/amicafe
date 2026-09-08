import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Tenta di leggere dalle tabelle per verificarne l'esistenza
    const testReservation = await db.reservation.findFirst()
    const testCompanyData = await db.companyData.findFirst()

    return NextResponse.json({
      success: true,
      message: 'Tabelle già esistenti',
      tables: {
        reservations: !!testReservation,
        companyData: !!testCompanyData
      }
    })
  } catch (error: any) {
    // Se c'è un errore, significa che le tabelle non esistono
    const errorInfo = {
      code: error.code,
      message: error.message
    }

    return NextResponse.json({
      success: false,
      error: 'Le tabelle non esistono nel database',
      details: errorInfo,
      instructions: 'Esegui: bunx prisma db push nel terminale locale per sincronizzare il database'
    }, { status: 400 })
  }
}