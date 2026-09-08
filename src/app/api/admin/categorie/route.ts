import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera tutte le categorie
export async function GET() {
  try {
    const categorie = await db.categoria.findMany({
      include: {
        _count: {
          select: { articoli: true }
        }
      },
      orderBy: { ordine: 'asc' }
    });

    return NextResponse.json(categorie);
  } catch (error) {
    console.error('Errore nel recupero categorie:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero delle categorie' },
      { status: 500 }
    );
  }
}

// POST - Crea una nuova categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, ordine, attiva } = body;

    if (!nome) {
      return NextResponse.json(
        { error: 'Il nome è obbligatorio' },
        { status: 400 }
      );
    }

    const categoria = await db.categoria.create({
      data: {
        nome,
        ordine: ordine || 0,
        attiva: attiva !== undefined ? attiva : true
      }
    });

    return NextResponse.json(categoria, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione categoria:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione della categoria' },
      { status: 500 }
    );
  }
}
