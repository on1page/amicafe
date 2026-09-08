import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera tutte le immagini, opzionalmente filtrate per sezione
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sezione = searchParams.get('sezione');

    const where: any = {};
    if (sezione) {
      where.sezione = sezione;
    }

    const images = await db.siteImage.findMany({
      where,
      orderBy: { ordine: 'asc' }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Errore nel recupero immagini:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle immagini' },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova immagine
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sezione, titolo, descrizione, url, ordine, attiva } = body;

    if (!sezione || !url) {
      return NextResponse.json(
        { error: 'Sezione e URL sono obbligatori' },
        { status: 400 }
      );
    }

    const image = await db.siteImage.create({
      data: {
        sezione,
        titolo,
        descrizione,
        url,
        ordine: ordine || 0,
        attiva: attiva !== undefined ? attiva : true
      }
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione immagine:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'immagine' },
      { status: 500 }
    );
  }
}
