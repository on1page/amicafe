import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera le informazioni del sito
export async function GET() {
  try {
    let siteInfo = await db.siteInfo.findFirst();

    // Se non esiste, crealo con valori di default
    if (!siteInfo) {
      siteInfo = await db.siteInfo.create({
        data: {
          nomeLocale: 'Il Nostro Ristorante',
          heroTitle: 'Autentica Cucina Italiana',
          heroCTAText: 'Scopri il Menu',
          specialitaTitle: 'Le Nostre Specialità'
        }
      });
    }

    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error('Errore nel recupero site info:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle informazioni del sito' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna le informazioni del sito
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Log per debug
    console.log('PUT /api/admin/site-info - Ricevuto body:', JSON.stringify(body, null, 2));

    const {
      id,
      nomeLocale,
      slogan,
      chiSiamoTitolo,
      chiSiamoTesto,
      chiSiamoImageUrl,
      logoUrl,
      faviconUrl,
      telefono,
      email,
      prenotazioniAttive,
      // Hero Section
      heroTitle,
      heroSubtitle,
      heroCTAText,
      heroImageUrl,
      heroOverlayOpacity,
      // Specialità Section
      specialitaTitle,
      specialitaSubtitle,
      // Theme Colors
      primaryColor,
      primaryForeground,
      // SEO Section
      seoTitle,
      seoDescription,
      seoKeywords,
      seoOgTitle,
      seoOgDescription,
      seoOgImage,
      seoTwitterCard,
      seoRobots,
      seoCanonical
    } = body;

    // Cerca se esiste già un record
    let siteInfo = await db.siteInfo.findFirst();

    console.log('SiteInfo trovato:', siteInfo ? siteInfo.id : 'Nessuno');

    const updateData: any = {}
    // Includi solo i campi che sono stati inviati (non undefined)
    // Permetti di salvare stringhe vuote per cancellare i valori
    if (nomeLocale !== undefined) updateData.nomeLocale = nomeLocale
    if (slogan !== undefined) updateData.slogan = slogan
    if (chiSiamoTitolo !== undefined) updateData.chiSiamoTitolo = chiSiamoTitolo
    if (chiSiamoTesto !== undefined) updateData.chiSiamoTesto = chiSiamoTesto
    if (chiSiamoImageUrl !== undefined) updateData.chiSiamoImageUrl = chiSiamoImageUrl
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl
    if (faviconUrl !== undefined) updateData.faviconUrl = faviconUrl
    if (telefono !== undefined) updateData.telefono = telefono
    if (email !== undefined) updateData.email = email
    if (prenotazioniAttive !== undefined) updateData.prenotazioniAttive = prenotazioniAttive

    // Hero Section
    if (heroTitle !== undefined) updateData.heroTitle = heroTitle
    if (heroSubtitle !== undefined) updateData.heroSubtitle = heroSubtitle
    if (heroCTAText !== undefined) updateData.heroCTAText = heroCTAText
    if (heroImageUrl !== undefined) updateData.heroImageUrl = heroImageUrl
    if (heroOverlayOpacity !== undefined) updateData.heroOverlayOpacity = heroOverlayOpacity

    // Specialità Section
    if (specialitaTitle !== undefined) updateData.specialitaTitle = specialitaTitle
    if (specialitaSubtitle !== undefined) updateData.specialitaSubtitle = specialitaSubtitle

    // Theme Colors
    if (primaryColor !== undefined) updateData.primaryColor = primaryColor
    if (primaryForeground !== undefined) updateData.primaryForeground = primaryForeground

    // SEO Section
    if (seoTitle !== undefined) updateData.seoTitle = seoTitle
    if (seoDescription !== undefined) updateData.seoDescription = seoDescription
    if (seoKeywords !== undefined) updateData.seoKeywords = seoKeywords
    if (seoOgTitle !== undefined) updateData.seoOgTitle = seoOgTitle
    if (seoOgDescription !== undefined) updateData.seoOgDescription = seoOgDescription
    if (seoOgImage !== undefined) updateData.seoOgImage = seoOgImage
    if (seoTwitterCard !== undefined) updateData.seoTwitterCard = seoTwitterCard
    if (seoRobots !== undefined) updateData.seoRobots = seoRobots
    if (seoCanonical !== undefined) updateData.seoCanonical = seoCanonical

    console.log('UpdateData:', JSON.stringify(updateData, null, 2));

    if (siteInfo) {
      // Aggiorna il record esistente
      console.log('Aggiornamento record esistente con ID:', siteInfo.id);
      siteInfo = await db.siteInfo.update({
        where: { id: siteInfo.id },
        data: updateData
      });
      console.log('Aggiornamento completato con successo');
    } else {
      // Crea un nuovo record
      console.log('Creazione nuovo record');
      const createData: any = {
        nomeLocale: nomeLocale || 'Il Nostro Ristorante',
        slogan: slogan || null,
        chiSiamoTitolo: chiSiamoTitolo || null,
        chiSiamoTesto: chiSiamoTesto || null,
        chiSiamoImageUrl: chiSiamoImageUrl || null,
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
        telefono: telefono || null,
        email: email || null,
        heroTitle: heroTitle || 'Autentica Cucina Italiana',
        heroSubtitle: heroSubtitle || null,
        heroCTAText: heroCTAText || 'Scopri il Menu',
        heroImageUrl: heroImageUrl || null,
        heroOverlayOpacity: heroOverlayOpacity || 0.5,
        specialitaTitle: specialitaTitle || 'Le Nostre Specialità',
        specialitaSubtitle: specialitaSubtitle || null,
        prenotazioniAttive: prenotazioniAttive !== undefined ? prenotazioniAttive : true,
        // Theme Colors
        primaryColor: primaryColor || '#ea580c',
        primaryForeground: primaryForeground || '#ffffff',
        // SEO defaults
        seoTitle: seoTitle || 'Z.ai Code Scaffold - AI-Powered Development',
        seoDescription: seoDescription || 'Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.',
        seoKeywords: seoKeywords || 'Z.ai, Next.js, TypeScript, Tailwind CSS, shadcn/ui, AI development, React',
        seoOgTitle: seoOgTitle || null,
        seoOgDescription: seoOgDescription || null,
        seoOgImage: seoOgImage || null,
        seoTwitterCard: seoTwitterCard || 'summary_large_image',
        seoRobots: seoRobots || null,
        seoCanonical: seoCanonical || null
      }

      console.log('CreateData:', JSON.stringify(createData, null, 2));

      siteInfo = await db.siteInfo.create({
        data: createData
      });
      console.log('Creazione completata con successo, ID:', siteInfo.id);
    }

    return NextResponse.json(siteInfo);
  } catch (error) {
    console.error('Errore nell\'aggiornamento site info:', error);

    // Log dettagliato dell'errore
    if (error instanceof Error) {
      console.error('Nome errore:', error.name);
      console.error('Messaggio errore:', error.message);
      console.error('Stack trace:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento delle informazioni del sito',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}
