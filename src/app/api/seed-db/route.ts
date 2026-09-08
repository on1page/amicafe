import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // Verifica se il database ha già dati
    const allergeniCount = await db.allergene.count()

    if (allergeniCount > 0) {
      return NextResponse.json({
        message: 'Database già popolato',
        allergeni: allergeniCount
      })
    }

    // Crea allergeni
    const allergeni = await Promise.all([
      db.allergene.create({
        data: { nome: 'Glutine', descrizione: 'Contiene cereali contenenti glutine', icona: '🌾' }
      }),
      db.allergene.create({
        data: { nome: 'Crostacei', descrizione: 'Contiene crostacei', icona: '🦐' }
      }),
      db.allergene.create({
        data: { nome: 'Uova', descrizione: 'Contiene uova', icona: '🥚' }
      }),
      db.allergene.create({
        data: { nome: 'Pesce', descrizione: 'Contiene pesce', icona: '🐟' }
      }),
      db.allergene.create({
        data: { nome: 'Latte', descrizione: 'Contiene latte', icona: '🥛' }
      }),
      db.allergene.create({
        data: { nome: 'Frutta a guscio', descrizione: 'Contiene frutta a guscio', icona: '🥜' }
      }),
      db.allergene.create({
        data: { nome: 'Soia', descrizione: 'Contiene soia', icona: '🫘' }
      }),
      db.allergene.create({
        data: { nome: 'Sedano', descrizione: 'Contiene sedano', icona: '🌿' }
      })
    ])

    // Crea categorie
    const categorie = await Promise.all([
      db.categoria.create({ data: { nome: 'Antipasti', ordine: 1 } }),
      db.categoria.create({ data: { nome: 'Primi Piatti', ordine: 2 } }),
      db.categoria.create({ data: { nome: 'Secondi Piatti', ordine: 3 } }),
      db.categoria.create({ data: { nome: 'Dolci', ordine: 4 } }),
      db.categoria.create({ data: { nome: 'Bevande', ordine: 5 } })
    ])

    // Crea articoli di esempio
    await db.articolo.createMany({
      data: [
        {
          nome: 'Spaghetti alla Carbonara',
          descrizione: 'Pasta fresca con guanciale, pecorino e pepe',
          categoriaId: categorie[1].id,
          prezzo: 14.00,
          prezzoPromozionale: 11.50,
          eBestChoice: true,
          immagineUrl: '/images/pasta.jpg'
        },
        {
          nome: 'Tagliata alla Fiorentina',
          descrizione: 'Bistecca di manzo alla griglia',
          categoriaId: categorie[2].id,
          prezzo: 28.00,
          eBestChoice: true,
          immagineUrl: '/images/meat.jpg'
        },
        {
          nome: 'Tiramisù Classico',
          descrizione: 'Savoiardi, caffè, mascarpone e cacao',
          categoriaId: categorie[3].id,
          prezzo: 8.00,
          eBestChoice: true,
          immagineUrl: '/images/tiramisu.jpg'
        }
      ]
    })

    // Crea info sito
    await db.siteInfo.create({
      data: {
        nomeLocale: 'La Bella Tavola',
        slogan: 'Autentica Cucina Italiana dal 1985',
        chiSiamoTitolo: 'La Nostra Storia',
        chiSiamoTesto: 'Dal 1985, portiamo in tavola l\'autentica tradizione culinaria italiana.',
        telefono: '+39 02 1234 5678',
        email: 'info@labellatavola.it'
      }
    })

    // Crea info footer
    await db.footerInfo.create({
      data: {
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
        facebookUrl: 'https://facebook.com/labellatavola',
        instagramUrl: 'https://instagram.com/labellatavola',
        whatsappUrl: 'https://wa.me/39212345678'
      }
    })

    // Crea utente admin
    const admin = await db.user.create({
      data: {
        email: 'admin@labellatavola.it',
        nome: 'Mario',
        cognome: 'Rossi',
        password: 'admin123',
        ruolo: 'superadmin'
      }
    })

    // Crea permessi
    await db.permission.create({
      data: {
        userId: admin.id,
        puoGestireMenu: true,
        puoGestireFooter: true,
        puoGestireTemi: true,
        puoGestireProfili: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Database popolato con successo!',
      allergeni: allergeni.length,
      categorie: categorie.length
    })
  } catch (error) {
    console.error('Errore seed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto'
    return NextResponse.json(
      { error: 'Errore nel popolamento del database', details: errorMessage },
      { status: 500 }
    )
  }
}
