import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Ottieni tutti i permessi
    const permissions = await db.permission.findMany()

    // Aggiorna i permessi esistenti attivando Analytics
    for (const perm of permissions) {
      await db.permission.update({
        where: { id: perm.id },
        data: {
          puoGestireAnalytics: true
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Aggiornati ${permissions.length} permessi utenti`,
      updated: permissions.length
    })
  } catch (error) {
    console.error('Errore nell\'aggiornamento permessi:', error)
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dei permessi' },
      { status: 500 }
    )
  }
}
