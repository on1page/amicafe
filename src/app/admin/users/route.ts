import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera tutti gli utenti con i loro permessi
export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        permessi: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Errore nel recupero utenti:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero degli utenti' },
      { status: 500 }
    );
  }
}

// POST - Crea un nuovo utente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, nome, cognome, password, ruolo, permessi } = body;

    if (!email || !nome || !password) {
      return NextResponse.json(
        { error: 'Email, nome e password sono obbligatori' },
        { status: 400 }
      );
    }

    // Crea l'utente
    const user = await db.user.create({
      data: {
        email,
        nome,
        cognome,
        password, // In produzione, questo dovrebbe essere hashato (bcrypt)
        ruolo: ruolo || 'admin'
      }
    });

    // Crea i permessi se specificati
    if (permessi) {
      await db.permission.create({
        data: {
          userId: user.id,
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
    } else {
      // Crea permessi di default
      await db.permission.create({
        data: {
          userId: user.id
        }
      });
    }

    // Recupera l'utente completo con i permessi
    const userCompleto = await db.user.findUnique({
      where: { id: user.id },
      include: {
        permessi: true
      }
    });

    return NextResponse.json(userCompleto, { status: 201 });
  } catch (error) {
    console.error('Errore nella creazione utente:', error);
    return NextResponse.json(
      { error: 'Errore nella creazione dell\'utente' },
      { status: 500 }
    );
  }
}
