import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Aggiorna un articolo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

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
      immagineUrl
    } = body;

    // Aggiorna l'articolo
    const articolo = await db.articolo.update({
      where: { id },
      data: {
        nome,
        descrizione,
        categoriaId,
        prezzo: parseFloat(prezzo),
        prezzoPromozionale: prezzoPromozionale ? parseFloat(prezzoPromozionale) : null,
        scadenzaPromo: scadenzaPromo ? new Date(scadenzaPromo) : null,
        eSurgelato,
        eBestChoice,
        attivo,
        immagineUrl
      }
    });

    // Gestisci gli allergeni
    // Prima elimina tutti gli allergeni esistenti
    await db.allergeneArticolo.deleteMany({
      where: { articoloId: id }
    });

    // Poi aggiungi i nuovi allergeni
    if (allergeni && allergeni.length > 0) {
      await db.allergeneArticolo.createMany({
        data: allergeni.map((allergeneId: string) => ({
          articoloId: id,
          allergeneId
        }))
      });
    }

    // Recupera l'articolo completo con gli allergeni
    const articoloCompleto = await db.articolo.findUnique({
      where: { id },
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

    return NextResponse.json(response);
  } catch (error) {
    console.error('Errore nell\'aggiornamento articolo:', error);
    return NextResponse.json(
      { error: 'Errore nell\'aggiornamento dell\'articolo' },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un articolo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await db.articolo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Errore nell\'eliminazione articolo:', error);
    return NextResponse.json(
      { error: 'Errore nell\'eliminazione dell\'articolo' },
      { status: 500 }
    );
  }
}
