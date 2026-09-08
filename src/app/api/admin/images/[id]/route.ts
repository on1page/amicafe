import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Aggiorna un'immagine
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json();
    const { sezione, titolo, descrizione, url, ordine, attiva } = body;

    const image = await db.siteImage.update({
      where: { id },
      data: {
        sezione,
        titolo,
        descrizione,
        url,
        ordine,
        attiva
      }
    });

    return NextResponse.json(image);
  } catch (error) {
    console.error('Errore nell\'aggiornamento immagine:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'immagine' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un'immagine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await db.siteImage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'eliminazione immagine:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'immagine' },
      { status: 500 }
    );
  }
}