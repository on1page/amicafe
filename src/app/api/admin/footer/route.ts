import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera le informazioni del footer
export async function GET() {
  try {
    let footerInfo = await db.footerInfo.findFirst();

    // Se non esiste, crealo vuoto
    if (!footerInfo) {
      footerInfo = await db.footerInfo.create({
        data: {}
      });
    }

    return NextResponse.json(footerInfo);
  } catch (error) {
    console.error('Errore nel recupero footer info:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle informazioni del footer' },
      { status: 500 }
    );
  }
}

// PUT - Aggiorna le informazioni del footer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      indirizzo,
      citta,
      cap,
      provincia,
      latitudine,
      longitudine,
      orariApertura,
      giorniChiusura,
      telefono,
      facebookUrl,
      instagramUrl,
      twitterUrl,
      linkedinUrl,
      whatsappUrl,
      tiktokUrl,
      justeatUrl,
      deliverooUrl,
      glovoUrl,
      ubereatsUrl
    } = body;

    // Cerca se esiste già un record
    let footerInfo = await db.footerInfo.findFirst();

    if (footerInfo) {
      // Aggiorna il record esistente
      footerInfo = await db.footerInfo.update({
        where: { id: footerInfo.id },
        data: {
          indirizzo,
          citta,
          cap,
          provincia,
          latitudine: latitudine ? parseFloat(latitudine) : null,
          longitudine: longitudine ? parseFloat(longitudine) : null,
          orariApertura,
          giorniChiusura,
          telefono,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          linkedinUrl,
          whatsappUrl,
          tiktokUrl,
          justeatUrl,
          deliverooUrl,
          glovoUrl,
          ubereatsUrl
        }
      });
    } else {
      // Crea un nuovo record
      footerInfo = await db.footerInfo.create({
        data: {
          indirizzo,
          citta,
          cap,
          provincia,
          latitudine: latitudine ? parseFloat(latitudine) : null,
          longitudine: longitudine ? parseFloat(longitudine) : null,
          orariApertura,
          giorniChiusura,
          telefono,
          facebookUrl,
          instagramUrl,
          twitterUrl,
          linkedinUrl,
          whatsappUrl,
          tiktokUrl,
          justeatUrl,
          deliverooUrl,
          glovoUrl,
          ubereatsUrl
        }
      });
    }

    return NextResponse.json(footerInfo);
  } catch (error) {
    console.error('Errore nell\'aggiornamento footer info:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento delle informazioni del footer' },
      { status: 500 }
    );
  }
}
