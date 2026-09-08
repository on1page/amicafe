import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Aggiorna un utente e i suoi permessi
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 16: params è una Promise, deve essere awaitata
  const { id } = await params

  try {
    const body = await request.json();
    const { email, nome, cognome, password, ruolo, permessi } = body;

    // Prepara i dati per l'aggiornamento
    const updateData: any = {
      email,
      nome,
      cognome,
      ruolo
    }

    // Aggiorna la password solo se fornita (non vuota)
    if (password && password.trim() !== '') {
      updateData.password = password
    }

    // Aggiorna l'utente
    const user = await db.user.update({
      where: { id },
      data: updateData
    });

    // Aggiorna i permessi se specificati
    if (permessi) {
      const existingPermissions = await db.permission.findUnique({
        where: { userId: id }
      });

      if (existingPermissions) {
        await db.permission.update({
          where: { userId: id },
          data: {
            puoGestireMenu: permessi.puoGestireMenu,
            puoGestireFooter: permessi.puoGestireFooter,
            puoGestireTemi: permessi.puoGestireTemi,
            puoGestirePrenotazioni: permessi.puoGestirePrenotazioni,
            puoGestireDatiAzienda: permessi.puoGestireDatiAzienda,
            puoGestireProfili: permessi.puoGestireProfili,
            puoGestireAnalytics: permessi.puoGestireAnalytics,
            puoGestireSito: permessi.puoGestireSito
          }
        });
      } else {
        await db.permission.create({
          data: {
            userId: id,
            puoGestireMenu: permessi.puoGestireMenu ?? true,
            puoGestireFooter: permessi.puoGestireFooter ?? true,
            puoGestireTemi: permessi.puoGestireTemi ?? true,
            puoGestirePrenotazioni: permessi.puoGestirePrenotazioni ?? true,
            puoGestireDatiAzienda: permessi.puoGestireDatiAzienda ?? true,
            puoGestireProfili: permessi.puoGestireProfili ?? false,
            puoGestireAnalytics: permessi.puoGestireAnalytics ?? true,
            puoGestireSito: permessi.puoGestireSito ?? true
          }
        });
      }
    }

    // Recupera l'utente completo con i permessi
    const userCompleto = await db.user.findUnique({
      where: { id },
      include: {
        permessi: true
      }
    });

    return NextResponse.json(userCompleto);
  } catch (error: any) {
    console.error('Errore nell\'aggiornamento utente:', error);
    return NextResponse.json(
      {
        error: 'Errore nell\'aggiornamento dell\'utente',
        details: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}

// DELETE - Elimina un utente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Next.js 16: params è una Promise, deve essere awaitata
  const { id } = await params

  try {
    await db.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Errore nell\'eliminazione utente:', error);
    console.error('Dettagli errore:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });
    return NextResponse.json(
      {
        error: 'Errore nell\'eliminazione dell\'utente',
        details: error?.message || 'Errore sconosciuto'
      },
      { status: 500 }
    );
  }
}
