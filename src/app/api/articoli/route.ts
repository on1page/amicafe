import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const oggi = new Date();

    // Recupera gli articoli attivi con eBestChoice true OR prezzoPromozionale non null e scadenzaPromo valida
    const result = await db.$queryRaw`
      SELECT * FROM "Articolo"
      WHERE attivo = true
        AND ("eBestChoice" = true
             OR ("prezzoPromozionale" IS NOT NULL AND "scadenzaPromo" > ${oggi}))
      ORDER BY "createdAt" ASC
    `;

    // Converti le date da stringa a oggetto Date per compatibilità
    const articoli = (result as any[]).map(item => ({
      ...item,
      prezzoPromozionale: item.prezzoPromozionale ? parseFloat(item.prezzoPromozionale) : null,
      prezzo: parseFloat(item.prezzo),
      scadenzaPromo: item.scadenzaPromo ? new Date(item.scadenzaPromo) : null,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
    }));

    return NextResponse.json(articoli);
  } catch (error) {
    console.error('Errore nel recupero degli articoli:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli articoli', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const articolo = await db.articolo.create({
      data: {
        nome: body.nome,
        descrizione: body.descrizione,
        categoriaId: body.categoriaId,
        prezzo: parseFloat(body.prezzo),
        prezzoPromozionale: body.prezzoPromozionale ? parseFloat(body.prezzoPromozionale) : null,
        scadenzaPromo: body.scadenzaPromo ? new Date(body.scadenzaPromo) : null,
        eSurgelato: body.eSurgelato || false,
        eBestChoice: body.eBestChoice || false,
        attivo: body.attivo !== undefined ? body.attivo : true,
        immagineUrl: body.immagineUrl,
        immagineAiGenerata: body.immagineAiGenerata || false,
      },
    });

    return NextResponse.json(articolo, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione dell\'articolo:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'articolo' },
      { status: 500 }
    );
  }
}