import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera tutti gli articoli
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoriaId = searchParams.get('categoriaId');
    const bestChoice = searchParams.get('bestChoice');
    const inPromo = searchParams.get('inPromo');

    const where: any = { attivo: true };

    if (categoriaId) {
      where.categoriaId = categoriaId;
    }

    // Se entrambi i filtri sono attivi, usa OR (bestChoice OPPURE inPromo)
    if (bestChoice === 'true' && inPromo === 'true') {
      where.OR = [
        { eBestChoice: true },
        {
          prezzoPromozionale: { not: null },
          scadenzaPromo: { gte: new Date() }
        }
      ];
    } else {
      // Se solo uno dei filtri è attivo, usa AND normale
      if (bestChoice === 'true') {
        where.eBestChoice = true;
      }

      if (inPromo === 'true') {
        where.prezzoPromozionale = { not: null };
        where.scadenzaPromo = { gte: new Date() };
      }
    }

    const articoli = await db.articolo.findMany({
      where,
      include: {
        categoria: true,
        allergeni: {
          include: {
            allergene: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Formatta la risposta
    const articoliFormattati = articoli.map(articolo => ({
      ...articolo,
      allergeni: articolo.allergeni.map(aa => aa.allergene)
    }));

    return NextResponse.json(articoliFormattati);
  } catch (error) {
    console.error('Errore nel recupero articoli:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli articoli' },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo articolo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nome,
      descrizione,
      categoriaId,
      prezzo,
      prezzoPromozionale,
      scadenzaPromo,
      eSurgelato,
      eBestChoice,
      attivo,
      allergeni,
      immagineUrl,
      immagineAiGenerata
    } = body;

    if (!nome || !prezzo || !categoriaId) {
      return NextResponse.json(
        { error: 'Nome, prezzo e categoria sono obbligatori' },
        { status: 400 }
      );
    }

    // Crea l'articolo
    const articolo = await db.articolo.create({
      data: {
        nome,
        descrizione,
        categoriaId,
        prezzo: parseFloat(prezzo),
        prezzoPromozionale: prezzoPromozionale ? parseFloat(prezzoPromozionale) : null,
        scadenzaPromo: scadenzaPromo ? new Date(scadenzaPromo) : null,
        eSurgelato: eSurgelato || false,
        eBestChoice: eBestChoice || false,
        attivo: attivo !== undefined ? attivo : true,
        immagineUrl,
        immagineAiGenerata: immagineAiGenerata || false
      }
    });

    // Aggiungi gli allergeni se presenti
    if (allergeni && allergeni.length > 0) {
      await db.allergeneArticolo.createMany({
        data: allergeni.map((allergeneId: string) => ({
          articoloId: articolo.id,
          allergeneId
        }))
      });
    }

    // Recupera l'articolo completo con gli allergeni
    const articoloCompleto = await db.articolo.findUnique({
      where: { id: articolo.id },
      include: {
        categoria: true,
        allergeni: {
          include: {
            allergene: true
          }
        }
      }
    });

    const response = {
      ...articoloCompleto,
      allergeni: articoloCompleto?.allergeni.map(aa => aa.allergene)
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione articolo:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'articolo' },
      { status: 500 }
    );
  }
}
