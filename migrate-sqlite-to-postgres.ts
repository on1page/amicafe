import { PrismaClient } from '@prisma/client';
import Database from 'bun:sqlite';
import path from 'path';

const sqliteDbPath = path.join(__dirname, 'my-project', 'db', 'custom.db');
const DATABASE_URL = 'postgres://f03b6a41bc4fe4035e4453264b946e79599fdb927e81a68d46c785283a27a2ef:sk_ZRix9vrwCr66dqfYTJn1a@db.prisma.io:5432/postgres?sslmode=require';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

console.log('🔄 Inizio migrazione dati da SQLite a PostgreSQL...\n');

// Apri database SQLite
const sqlite = new Database(sqliteDbPath);

// Funzione helper per convertire timestamp
const toDate = (ts: number | null) => ts ? new Date(ts) : null;
const toBoolean = (val: number) => val === 1;

async function migrate() {
  try {
    // 1. Migra Allergeni
    console.log('📝 Migrazione Allergeni...');
    const allergeni = sqlite.prepare('SELECT * FROM Allergene').all();
    console.log(`   Trovati ${allergeni.length} allergeni`);

    for (const a of allergeni as any[]) {
      await prisma.allergene.upsert({
        where: { id: a.id },
        update: {
          nome: a.nome,
          descrizione: a.descrizione,
          icona: a.icona,
          updatedAt: toDate(a.updatedAt)
        },
        create: {
          id: a.id,
          nome: a.nome,
          descrizione: a.descrizione,
          icona: a.icona,
          createdAt: toDate(a.createdAt) || new Date(),
          updatedAt: toDate(a.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ Allergeni migrati\n');

    // 2. Migra Categorie
    console.log('📁 Migrazione Categorie...');
    const categorie = sqlite.prepare('SELECT * FROM Categoria').all();
    console.log(`   Trovate ${categorie.length} categorie`);

    for (const c of categorie as any[]) {
      await prisma.categoria.upsert({
        where: { id: c.id },
        update: {
          nome: c.nome,
          ordine: c.ordine,
          attiva: toBoolean(c.attiva),
          updatedAt: toDate(c.updatedAt)
        },
        create: {
          id: c.id,
          nome: c.nome,
          ordine: c.ordine,
          attiva: toBoolean(c.attiva),
          createdAt: toDate(c.createdAt) || new Date(),
          updatedAt: toDate(c.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ Categorie migrate\n');

    // 3. Migra Articoli
    console.log('🍝 Migrazione Articoli...');
    const articoli = sqlite.prepare('SELECT * FROM Articolo').all();
    console.log(`   Trovati ${articoli.length} articoli`);

    for (const art of articoli as any[]) {
      // Verifica se la categoria esiste
      const categoria = await prisma.categoria.findUnique({
        where: { id: art.categoriaId }
      });

      if (!categoria) {
        console.log(`   ⚠️  Categoria ${art.categoriaId} non trovata per articolo ${art.nome}`);
        continue;
      }

      await prisma.articolo.upsert({
        where: { id: art.id },
        update: {
          nome: art.nome,
          descrizione: art.descrizione,
          categoriaId: art.categoriaId,
          prezzo: art.prezzo,
          prezzoPromozionale: art.prezzoPromozionale,
          scadenzaPromo: toDate(art.scadenzaPromo),
          eSurgelato: toBoolean(art.eSurgelato),
          eBestChoice: toBoolean(art.eBestChoice),
          attivo: toBoolean(art.attivo),
          immagineUrl: art.immagineUrl,
          updatedAt: toDate(art.updatedAt)
        },
        create: {
          id: art.id,
          nome: art.nome,
          descrizione: art.descrizione,
          categoriaId: art.categoriaId,
          prezzo: art.prezzo,
          prezzoPromozionale: art.prezzoPromozionale,
          scadenzaPromo: toDate(art.scadenzaPromo),
          eSurgelato: toBoolean(art.eSurgelato),
          eBestChoice: toBoolean(art.eBestChoice),
          attivo: toBoolean(art.attivo),
          immagineUrl: art.immagineUrl,
          createdAt: toDate(art.createdAt) || new Date(),
          updatedAt: toDate(art.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ Articoli migrati\n');

    // 4. Migra AllergeneArticolo (relazioni)
    console.log('🔗 Migrazione relazioni Allergene-Articolo...');
    const allergeneArticoli = sqlite.prepare('SELECT * FROM AllergeneArticolo').all();
    console.log(`   Trovate ${allergeneArticoli.length} relazioni`);

    for (const aa of allergeneArticoli as any[]) {
      // Verifica che esistano entrambi
      const articolo = await prisma.articolo.findUnique({ where: { id: aa.articoloId } });
      const allergene = await prisma.allergene.findUnique({ where: { id: aa.allergeneId } });

      if (!articolo || !allergene) {
        console.log(`   ⚠️  Relazione saltata: articolo ${aa.articoloId} o allergene ${aa.allergeneId} non trovato`);
        continue;
      }

      await prisma.allergeneArticolo.upsert({
        where: { id: aa.id },
        update: {},
        create: {
          id: aa.id,
          articoloId: aa.articoloId,
          allergeneId: aa.allergeneId
        }
      });
    }
    console.log('   ✅ Relazioni migrate\n');

    // 5. Migra SiteInfo
    console.log('🏠 Migrazione SiteInfo...');
    const siteInfos = sqlite.prepare('SELECT * FROM SiteInfo').all();
    console.log(`   Trovati ${siteInfos.length} SiteInfo`);

    for (const si of siteInfos as any[]) {
      await prisma.siteInfo.upsert({
        where: { id: si.id },
        update: {
          nomeLocale: si.nomeLocale,
          slogan: si.slogan,
          chiSiamoTitolo: si.chiSiamoTitolo,
          chiSiamoTesto: si.chiSiamoTesto,
          chiSiamoImageUrl: si.chiSiamoImageUrl,
          logoUrl: si.logoUrl,
          faviconUrl: si.faviconUrl,
          telefono: si.telefono,
          email: si.email,
          prenotazioniAttive: si.prenotazioniAttive !== undefined ? toBoolean(si.prenotazioniAttive) : true,
          heroTitle: si.heroTitle,
          heroSubtitle: si.heroSubtitle,
          heroCTAText: si.heroCTAText,
          heroImageUrl: si.heroImageUrl,
          heroOverlayOpacity: si.heroOverlayOpacity || 0.5,
          specialitaTitle: si.specialitaTitle,
          specialitaSubtitle: si.specialitaSubtitle,
          updatedAt: toDate(si.updatedAt)
        },
        create: {
          id: si.id,
          nomeLocale: si.nomeLocale,
          slogan: si.slogan,
          chiSiamoTitolo: si.chiSiamoTitolo,
          chiSiamoTesto: si.chiSiamoTesto,
          chiSiamoImageUrl: si.chiSiamoImageUrl,
          logoUrl: si.logoUrl,
          faviconUrl: si.faviconUrl,
          telefono: si.telefono,
          email: si.email,
          prenotazioniAttive: si.prenotazioniAttive !== undefined ? toBoolean(si.prenotazioniAttive) : true,
          heroTitle: si.heroTitle,
          heroSubtitle: si.heroSubtitle,
          heroCTAText: si.heroCTAText,
          heroImageUrl: si.heroImageUrl,
          heroOverlayOpacity: si.heroOverlayOpacity || 0.5,
          specialitaTitle: si.specialitaTitle,
          specialitaSubtitle: si.specialitaSubtitle,
          createdAt: toDate(si.createdAt) || new Date(),
          updatedAt: toDate(si.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ SiteInfo migrati\n');

    // 6. Migra FooterInfo
    console.log('📍 Migrazione FooterInfo...');
    const footerInfos = sqlite.prepare('SELECT * FROM FooterInfo').all();
    console.log(`   Trovati ${footerInfos.length} FooterInfo`);

    for (const fi of footerInfos as any[]) {
      await prisma.footerInfo.upsert({
        where: { id: fi.id },
        update: {
          indirizzo: fi.indirizzo,
          citta: fi.citta,
          cap: fi.cap,
          provincia: fi.provincia,
          latitudine: fi.latitudine,
          longitudine: fi.longitudine,
          orariApertura: fi.orariApertura,
          giorniChiusura: fi.giorniChiusura,
          facebookUrl: fi.facebookUrl,
          instagramUrl: fi.instagramUrl,
          twitterUrl: fi.twitterUrl,
          linkedinUrl: fi.linkedinUrl,
          whatsappUrl: fi.whatsappUrl,
          tiktokUrl: fi.tiktokUrl,
          justeatUrl: fi.justeatUrl,
          deliverooUrl: fi.deliverooUrl,
          glovoUrl: fi.glovoUrl,
          ubereatsUrl: fi.ubereatsUrl,
          updatedAt: toDate(fi.updatedAt)
        },
        create: {
          id: fi.id,
          indirizzo: fi.indirizzo,
          citta: fi.citta,
          cap: fi.cap,
          provincia: fi.provincia,
          latitudine: fi.latitudine,
          longitudine: fi.longitudine,
          orariApertura: fi.orariApertura,
          giorniChiusura: fi.giorniChiusura,
          facebookUrl: fi.facebookUrl,
          instagramUrl: fi.instagramUrl,
          twitterUrl: fi.twitterUrl,
          linkedinUrl: fi.linkedinUrl,
          whatsappUrl: fi.whatsappUrl,
          tiktokUrl: fi.tiktokUrl,
          justeatUrl: fi.justeatUrl,
          deliverooUrl: fi.deliverooUrl,
          glovoUrl: fi.glovoUrl,
          ubereatsUrl: fi.ubereatsUrl,
          createdAt: toDate(fi.createdAt) || new Date(),
          updatedAt: toDate(fi.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ FooterInfo migrati\n');

    // 7. Migra Utenti
    console.log('👤 Migrazione Utenti...');
    const users = sqlite.prepare('SELECT * FROM User').all();
    console.log(`   Trovati ${users.length} utenti`);

    for (const u of users as any[]) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email,
          nome: u.nome,
          cognome: u.cognome,
          password: u.password,
          ruolo: u.ruolo,
          updatedAt: toDate(u.updatedAt)
        },
        create: {
          id: u.id,
          email: u.email,
          nome: u.nome,
          cognome: u.cognome,
          password: u.password,
          ruolo: u.ruolo,
          createdAt: toDate(u.createdAt) || new Date(),
          updatedAt: toDate(u.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ Utenti migrati\n');

    // 8. Migra Permissions
    console.log('🔐 Migrazione Permessi...');
    const permissions = sqlite.prepare('SELECT * FROM Permission').all();
    console.log(`   Trovati ${permissions.length} permessi`);

    for (const p of permissions as any[]) {
      await prisma.permission.upsert({
        where: { userId: p.userId },
        update: {
          puoGestireMenu: p.puoGestireMenu !== undefined ? toBoolean(p.puoGestireMenu) : true,
          puoGestireFooter: p.puoGestireFooter !== undefined ? toBoolean(p.puoGestireFooter) : true,
          puoGestireTemi: p.puoGestireTemi !== undefined ? toBoolean(p.puoGestireTemi) : true,
          puoGestirePrenotazioni: p.puoGestirePrenotazioni !== undefined ? toBoolean(p.puoGestirePrenotazioni) : true,
          puoGestireDatiAzienda: p.puoGestireDatiAzienda !== undefined ? toBoolean(p.puoGestireDatiAzienda) : true,
          puoGestireProfili: p.puoGestireProfili !== undefined ? toBoolean(p.puoGestireProfili) : false,
          puoGestireAnalytics: p.puoGestireAnalytics !== undefined ? toBoolean(p.puoGestireAnalytics) : true,
          updatedAt: toDate(p.updatedAt)
        },
        create: {
          id: p.id,
          userId: p.userId,
          puoGestireMenu: p.puoGestireMenu !== undefined ? toBoolean(p.puoGestireMenu) : true,
          puoGestireFooter: p.puoGestireFooter !== undefined ? toBoolean(p.puoGestireFooter) : true,
          puoGestireTemi: p.puoGestireTemi !== undefined ? toBoolean(p.puoGestireTemi) : true,
          puoGestirePrenotazioni: p.puoGestirePrenotazioni !== undefined ? toBoolean(p.puoGestirePrenotazioni) : true,
          puoGestireDatiAzienda: p.puoGestireDatiAzienda !== undefined ? toBoolean(p.puoGestireDatiAzienda) : true,
          puoGestireProfili: p.puoGestireProfili !== undefined ? toBoolean(p.puoGestireProfili) : false,
          puoGestireAnalytics: p.puoGestireAnalytics !== undefined ? toBoolean(p.puoGestireAnalytics) : true,
          createdAt: toDate(p.createdAt) || new Date(),
          updatedAt: toDate(p.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ Permessi migrati\n');

    // 9. Migra SiteImage (se ci sono)
    console.log('🖼️  Migrazione SiteImage...');
    const siteImages = sqlite.prepare('SELECT * FROM SiteImage').all();
    console.log(`   Trovate ${siteImages.length} immagini`);

    for (const si of siteImages as any[]) {
      await prisma.siteImage.upsert({
        where: { id: si.id },
        update: {
          sezione: si.sezione,
          titolo: si.titolo,
          descrizione: si.descrizione,
          url: si.url,
          ordine: si.ordine,
          attiva: toBoolean(si.attiva),
          updatedAt: toDate(si.updatedAt)
        },
        create: {
          id: si.id,
          sezione: si.sezione,
          titolo: si.titolo,
          descrizione: si.descrizione,
          url: si.url,
          ordine: si.ordine,
          attiva: toBoolean(si.attiva),
          createdAt: toDate(si.createdAt) || new Date(),
          updatedAt: toDate(si.updatedAt) || new Date()
        }
      });
    }
    console.log('   ✅ SiteImage migrate\n');

    console.log('🎉 Migrazione completata con successo!\n');

    // Riepilogo
    console.log('📊 Riepilogo dati migrati:');
    console.log(`   - Allergeni: ${allergeni.length}`);
    console.log(`   - Categorie: ${categorie.length}`);
    console.log(`   - Articoli: ${articoli.length}`);
    console.log(`   - Relazioni Allergene-Articolo: ${allergeneArticoli.length}`);
    console.log(`   - SiteInfo: ${siteInfos.length}`);
    console.log(`   - FooterInfo: ${footerInfos.length}`);
    console.log(`   - Utenti: ${users.length}`);
    console.log(`   - Permessi: ${permissions.length}`);
    console.log(`   - SiteImage: ${siteImages.length}`);

  } catch (error) {
    console.error('❌ Errore durante la migrazione:', error);
    throw error;
  } finally {
    sqlite.close();
    await prisma.$disconnect();
  }
}

migrate()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
