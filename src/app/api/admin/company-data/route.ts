import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let companyData = await db.companyData.findFirst();

    if (!companyData) {
      companyData = await db.companyData.create({ data: {} });
    }

    return NextResponse.json(companyData);
  } catch (error) {
    console.error('Errore nel fetch dei dati azienda:', error);
    return NextResponse.json({ error: 'Errore nel recupero dati' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const companyData = await db.companyData.findFirst();

    if (!companyData) {
      const newData = await db.companyData.create({
        data: {
          ragioneSociale: body.ragioneSociale,
          partitaIva: body.partitaIva,
          codiceFiscale: body.codiceFiscale,
          indirizzo: body.indirizzo,
          citta: body.citta,
          cap: body.cap,
          provincia: body.provincia,
          paese: body.paese,
          telefono: body.telefono,
          email: body.email,
          pec: body.pec,
          dpoNome: body.dpoNome,
          dpoEmail: body.dpoEmail,
          dpoIndirizzo: body.dpoIndirizzo,
          privacyPolicy: body.privacyPolicy,
          privacyEnabled: body.privacyEnabled,
          privacyUrl: body.privacyUrl,
          cookiesPolicy: body.cookiesPolicy,
          cookiesEnabled: body.cookiesEnabled,
          cookiesUrl: body.cookiesUrl,
          cookieTecnici: body.cookieTecnici,
          cookieAnalitici: body.cookieAnalitici,
          cookieMarketing: body.cookieMarketing,
          showCookieBanner: body.showCookieBanner,
          cookieBannerText: body.cookieBannerText,
          cookieAcceptText: body.cookieAcceptText,
          cookieDeclineText: body.cookieDeclineText,
          terminiServizio: body.terminiServizio,
          terminiUrl: body.terminiUrl,
          thirdPartyScriptsEnabled: body.thirdPartyScriptsEnabled,
          googleAnalyticsId: body.googleAnalyticsId,
          facebookPixelId: body.facebookPixelId,
          amazonTagId: body.amazonTagId,
          adSenseId: body.adSenseId,
          adSenseSlotHorizontal: body.adSenseSlotHorizontal,
          adSenseSlotRectangle: body.adSenseSlotRectangle,
          adSenseSlotTop: body.adSenseSlotTop,
          adSenseSlotInline: body.adSenseSlotInline,
        },
      });
      return NextResponse.json(newData);
    }

    const updatedData: any = {};

    const fields = [
      'ragioneSociale', 'partitaIva', 'codiceFiscale', 'indirizzo', 'citta',
      'cap', 'provincia', 'paese', 'telefono', 'email', 'pec', 'dpoNome',
      'dpoEmail', 'dpoIndirizzo', 'privacyPolicy', 'privacyEnabled', 'privacyUrl',
      'cookiesPolicy', 'cookiesEnabled', 'cookiesUrl', 'cookieTecnici',
      'cookieAnalitici', 'cookieMarketing', 'showCookieBanner',
      'cookieBannerText', 'cookieAcceptText', 'cookieDeclineText',
      'terminiServizio', 'terminiUrl', 'thirdPartyScriptsEnabled',
      'googleAnalyticsId', 'facebookPixelId', 'amazonTagId',
      'adSenseId', 'adSenseSlotHorizontal', 'adSenseSlotRectangle',
      'adSenseSlotTop', 'adSenseSlotInline'
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updatedData[field] = body[field];
      }
    });

    const result = await db.companyData.update({
      where: { id: companyData.id },
      data: updatedData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Errore nell\'aggiornamento dati azienda:', error);
    return NextResponse.json({ error: 'Errore nell\'aggiornamento' }, { status: 500 });
  }
}