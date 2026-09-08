import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera tutti gli allergeni
export async function GET() {
  try {
    const allergeni = await db.allergene.findMany({
      orderBy: { nome: 'asc' }
    });

    return NextResponse.json(allergeni);
  } catch (error) {
    console.error('Errore nel recupero allergeni:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli allergeni' },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo allergene
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, descrizione, icona } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Il nome è obbligatorio' },
        { status: 400 }
      );
    }

    const allergene = await db.allergene.create({
      data: {
        nome,
        descrizione,
        icona
      }
    });

    return NextResponse.json(allergene, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione allergene:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'allergene' },
      { status: 500 }
    );
  }
}
