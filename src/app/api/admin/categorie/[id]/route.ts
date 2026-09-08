import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Aggiorna una categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const body = await request.json();
    const { nome, ordine, attiva } = body;

    const categoria = await db.categoria.update({
      where: { id },
      data: {
        nome,
        ordine,
        attiva
      }
    });

    return NextResponse.json(categoria);
  } catch (error) {
    console.error('Errore nell\'aggiornamento categoria:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento della categoria' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina una categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await db.categoria.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'eliminazione categoria:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione della categoria' },
      { status: 500 }
    );
  }
}
