import { db } from './src/lib/db'

async function migrate() {
  try {
    console.log('Aggiunta colonna primaryColor alla tabella SiteInfo...')

    // Esegui la migrazione SQL raw
    await db.$executeRaw`ALTER TABLE "SiteInfo" ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT '#ea580c'`

    console.log('✅ Migrazione completata con successo!')

    // Verifica
    const siteInfo = await db.siteInfo.findFirst()
    console.log('Colore nel database:', siteInfo?.primaryColor || 'non impostato')

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

migrate()
