import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  console.log('📊 Verifica dati nel database...\n')

  // Check articoli
  const articoli = await prisma.articolo.findMany({
    where: { attivo: true },
    include: { categoria: true }
  })

  console.log(`🍝 Articoli attivi: ${articoli.length}`)
  articoli.forEach(art => {
    console.log(`  - ${art.nome} (€${art.prezzo.toFixed(2)})`)
    console.log(`    Categoria: ${art.categoria.nome}`)
    console.log(`    Best Choice: ${art.eBestChoice ? '✓' : '✗'}`)
    console.log(`    Promo: ${art.prezzoPromozionale ? `€${art.prezzoPromozionale.toFixed(2)}` : 'No'}`)
    console.log(`    Immagine: ${art.immagineUrl || 'Nessuna'}`)
    console.log('')
  })

  // Check site info
  const siteInfo = await prisma.siteInfo.findFirst()
  console.log(`🏠 Nome Locale: ${siteInfo?.nomeLocale}`)
  console.log(`📝 Slogan: ${siteInfo?.slogan}`)
  console.log('')

  // Check footer info
  const footerInfo = await prisma.footerInfo.findFirst()
  console.log(`📍 Indirizzo: ${footerInfo?.indirizzo}, ${footerInfo?.citta}`)
  console.log(`🌐 Facebook: ${footerInfo?.facebookUrl ? '✓' : '✗'}`)
  console.log(`📷 Instagram: ${footerInfo?.instagramUrl ? '✓' : '✗'}`)
  console.log(`📱 WhatsApp: ${footerInfo?.whatsappUrl ? '✓' : '✗'}`)
  console.log('')

  // Check images
  const images = await prisma.siteImage.findMany()
  console.log(`🖼️ Immagini salvate: ${images.length}`)

  await prisma.$disconnect()
}

checkData()
