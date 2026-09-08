import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Recupera l'utente corrente e i suoi permessi
export async function GET(request: NextRequest) {
  try {
    // Recupera il token dall'header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token non fornito' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Decodifica il token base64 (formato: userId:timestamp)
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [userId] = decoded.split(':');

      if (!userId) {
        return NextResponse.json(
          { error: 'Token non valido' },
          { status: 401 }
        );
      }

      // Recupera l'utente con i permessi
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          permessi: true
        }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'Utente non trovato' },
          { status: 404 }
        );
      }

      // Ritorna solo i dati necessari (senza la password)
      return NextResponse.json({
        id: user.id,
        email: user.email,
        nome: user.nome,
        cognome: user.cognome,
        ruolo: user.ruolo,
        permessi: user.permessi
      });
    } catch (decodeError) {
      console.error('Errore nella decodifica del token:', decodeError);
      return NextResponse.json(
        { error: 'Token non valido' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Errore nel recupero utente:', error);
    return NextResponse.json(
      { error: 'Errore nel recupero dell\'utente' },
      { status: 500 }
    );
  }
}
