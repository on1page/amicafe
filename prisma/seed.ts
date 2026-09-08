import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Inizio seed del database...')

  // 1. Crea allergeni (normativa europea completa)
  console.log('📝 Creazione allergeni...')
  const allergeni = await Promise.all([
    prisma.allergene.upsert({
      where: { nome: 'Glutine' },
      update: {},
      create: { nome: 'Glutine', descrizione: 'Contiene cereali contenenti glutine', icona: '🌾' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Crostacei' },
      update: {},
      create: { nome: 'Crostacei', descrizione: 'Contiene crostacei e prodotti a base di crostacei', icona: '🦐' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Uova' },
      update: {},
      create: { nome: 'Uova', descrizione: 'Contiene uova e prodotti a base di uova', icona: '🥚' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Pesce' },
      update: {},
      create: { nome: 'Pesce', descrizione: 'Contiene pesce e prodotti a base di pesce', icona: '🐟' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Arachidi' },
      update: {},
      create: { nome: 'Arachidi', descrizione: 'Contiene arachidi e prodotti a base di arachidi', icona: '🥜' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Soia' },
      update: {},
      create: { nome: 'Soia', descrizione: 'Contiene soia e prodotti a base di soia', icona: '🫘' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Latte' },
      update: {},
      create: { nome: 'Latte', descrizione: 'Contiene latte e prodotti a base di latte', icona: '🥛' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Frutta a guscio' },
      update: {},
      create: { nome: 'Frutta a guscio', descrizione: 'Contiene frutta a guscio', icona: '🥜' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Sedano' },
      update: {},
      create: { nome: 'Sedano', descrizione: 'Contiene sedano e prodotti a base di sedano', icona: '🌿' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Senape' },
      update: {},
      create: { nome: 'Senape', descrizione: 'Contiene senape e prodotti a base di senape', icona: '🌾' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Sesamo' },
      update: {},
      create: { nome: 'Sesamo', descrizione: 'Contiene semi di sesamo e prodotti a base di sesamo', icona: '🌱' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Anidride solforosa' },
      update: {},
      create: { nome: 'Anidride solforosa', descrizione: 'Contiene anidride solforosa e solfiti', icona: '💨' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Lupini' },
      update: {},
      create: { nome: 'Lupini', descrizione: 'Contiene lupini e prodotti a base di lupini', icona: '🌱' }
    }),
    prisma.allergene.upsert({
      where: { nome: 'Molluschi' },
      update: {},
      create: { nome: 'Molluschi', descrizione: 'Contiene molluschi e prodotti a base di molluschi', icona: '🦪' }
    })
  ])
  console.log(`✅ Creati ${allergeni.length} allergeni`)

  // 2. Crea categorie
  console.log('📁 Creazione categorie...')
  const categorie = await Promise.all([
    prisma.categoria.upsert({
      where: { id: 'cat-1' },
      update: {},
      create: { id: 'cat-1', nome: 'Antipasti', ordine: 1, attiva: true }
    }),
    prisma.categoria.upsert({
      where: { id: 'cat-2' },
      update: {},
      create: { id: 'cat-2', nome: 'Primi Piatti', ordine: 2, attiva: true }
    }),
    prisma.categoria.upsert({
      where: { id: 'cat-3' },
      update: {},
      create: { id: 'cat-3', nome: 'Secondi Piatti', ordine: 3, attiva: true }
    }),
    prisma.categoria.upsert({
      where: { id: 'cat-4' },
      update: {},
      create: { id: 'cat-4', nome: 'Dolci', ordine: 4, attiva: true }
    }),
    prisma.categoria.upsert({
      where: { id: 'cat-5' },
      update: {},
      create: { id: 'cat-5', nome: 'Bevande', ordine: 5, attiva: true }
    })
  ])
  console.log(`✅ Create ${categorie.length} categorie`)

  // 3. Crea articoli
  console.log('🍝 Creazione articoli...')
  const pasta = await prisma.articolo.create({
    data: {
      nome: 'Spaghetti alla Carbonara',
      descrizione: 'Pasta fresca con guanciale croccante, pecorino romano DOP, tuorlo d\'uovo e pepe nero',
      categoriaId: categorie[1].id,
      prezzo: 14.00,
      prezzoPromozionale: 11.50,
      scadenzaPromo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni da oggi
      eSurgelato: false,
      eBestChoice: true,
      attivo: true,
      immagineUrl: '/images/pasta.jpg',
      allergeni: {
        create: [
          { allergeneId: allergeni[0].id }, // Glutine
          { allergeneId: allergeni[2].id }, // Uova
          { allergeneId: allergeni[6].id }  // Latte
        ]
      }
    }
  })

  const carne = await prisma.articolo.create({
    data: {
      nome: 'Tagliata alla Fiorentina',
      descrizione: 'Bistecca di manzo alla griglia con rosmarino, olio extra vergine e sale grosso',
      categoriaId: categorie[2].id,
      prezzo: 28.00,
      eSurgelato: false,
      eBestChoice: true,
      attivo: true,
      immagineUrl: '/images/meat.jpg',
      allergeni: {
        create: []
      }
    }
  })

  const tiramisu = await prisma.articolo.create({
    data: {
      nome: 'Tiramisù Classico',
      descrizione: 'Savoiardi imbevuti nel caffè, crema al mascarpone con cacao amaro in polvere',
      categoriaId: categorie[3].id,
      prezzo: 8.00,
      eSurgelato: false,
      eBestChoice: true,
      attivo: true,
      immagineUrl: '/images/tiramisu.jpg',
      allergeni: {
        create: [
          { allergeneId: allergeni[2].id }, // Uova
          { allergeneId: allergeni[6].id }  // Latte
        ]
      }
    }
  })

  const bruschetta = await prisma.articolo.create({
    data: {
      nome: 'Bruschetta al Pomodoro',
      descrizione: 'Pane casereccio tostato con pomodorini freschi, basilico, aglio e olio extra vergine',
      categoriaId: categorie[0].id,
      prezzo: 7.50,
      eSurgelato: false,
      eBestChoice: false,
      attivo: true,
      allergeni: {
        create: [
          { allergeneId: allergeni[0].id } // Glutine
        ]
      }
    }
  })

  const risotto = await prisma.articolo.create({
    data: {
      nome: 'Risotto allo Zafferano',
      descrizione: 'Riso carnaroli con zafferano di qualità, burro e parmigiano reggiano 24 mesi',
      categoriaId: categorie[1].id,
      prezzo: 16.00,
      eSurgelato: false,
      eBestChoice: false,
      attivo: true,
      allergeni: {
        create: [
          { allergeneId: allergeni[6].id }  // Latte
        ]
      }
    }
  })

  const vino = await prisma.articolo.create({
    data: {
      nome: 'Chianti Classico',
      descrizione: 'Vino rosso toscano DOP, annata 2020, servito a temperatura ambiente',
      categoriaId: categorie[4].id,
      prezzo: 24.00,
      prezzoPromozionale: 19.00,
      scadenzaPromo: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 giorni da oggi
      eSurgelato: false,
      eBestChoice: false,
      attivo: true,
      allergeni: {
        create: [
          { allergeneId: allergeni[11].id } // Anidride solforosa
        ]
      }
    }
  })

  console.log('✅ Creati 6 articoli')

  // 4. Crea SiteInfo
  console.log('🏠 Creazione informazioni sito...')
  await prisma.siteInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nomeLocale: 'La Bella Tavola',
      slogan: 'Autentica Cucina Italiana dal 1985',
      chiSiamoTitolo: 'La Nostra Storia',
      chiSiamoTesto: 'Dal 1985, La Bella Tavola porta in tavola l\'autentica tradizione culinaria italiana. La nostra passione per la cucina e l\'amore per gli ingredienti freschi e di qualità si riflette in ogni piatto che prepariamo. Ogni giorno, il nostro chef seleziona personalmente i migliori prodotti locali per creare piatti che raccontano storie di gusto e tradizione.',
      telefono: '+39 02 1234 5678',
      email: 'info@labellatavola.it'
    }
  })
  console.log('✅ Create informazioni sito')

  // 5. Crea FooterInfo
  console.log('📍 Creazione informazioni footer...')
  await prisma.footerInfo.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      indirizzo: 'Via Roma 123',
      citta: 'Milano',
      cap: '20121',
      provincia: 'MI',
      latitudine: 45.4642,
      longitudine: 9.1900,
      orariApertura: JSON.stringify([
        { giorno: 'Lunedì - Venerdì', orario: '12:00 - 14:30, 19:00 - 23:00' },
        { giorno: 'Sabato', orario: '12:00 - 15:00, 19:00 - 00:00' },
        { giorno: 'Domenica', orario: '12:00 - 15:00' }
      ]),
      giorniChiusura: JSON.stringify(['Martedì a pranzo']),
      facebookUrl: 'https://facebook.com/labellatavola',
      instagramUrl: 'https://instagram.com/labellatavola',
      whatsappUrl: 'https://wa.me/39212345678',
      justeatUrl: 'https://www.justeat.it/ristoranti/labellatavola-milano'
    }
  })
  console.log('✅ Create informazioni footer')

  // 6. Crea utente Super Admin
  console.log('👤 Creazione utente superadmin...')
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@labellatavola.it' },
    update: {},
    create: {
      email: 'admin@labellatavola.it',
      nome: 'Mario',
      cognome: 'Rossi',
      password: 'admin123', // In produzione, questo dovrebbe essere hashato
      ruolo: 'superadmin'
    }
  })

  // Crea permessi per il superadmin
  await prisma.permission.upsert({
    where: { userId: superAdmin.id },
    update: {},
    create: {
      userId: superAdmin.id,
      puoGestireMenu: true,
      puoGestireFooter: true,
      puoGestireTemi: true,
      puoGestireProfili: true
    }
  })
  console.log('✅ Creato utente superadmin (email: admin@labellatavola.it, password: admin123)')

  console.log('🎉 Seed completato con successo!')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante il seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
