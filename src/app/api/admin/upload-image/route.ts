import { NextRequest, NextResponse } from 'next/server';

// Validazione delle estensioni dei file
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file inviato' },
        { status: 400 }
      );
    }

    // Validazione dimensione file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Il file supera la dimensione massima di 5MB' },
        { status: 400 }
      );
    }

    // Validazione estensione file
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: 'Formato file non supportato. Formati ammessi: jpg, jpeg, png, gif, webp' },
        { status: 400 }
      );
    }

    // Converti il file in Buffer e poi in base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;

    // Restituisci l'URL base64
    const fileUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name
    });

  } catch (error) {
    console.error('Errore durante l\'upload:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'upload del file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
