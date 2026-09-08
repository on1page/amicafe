import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log('Login attempt - Email:', email)

    if (!email || !password) {
      console.log('Login failed - Missing credentials')
      return NextResponse.json(
        { error: 'Email e password sono richiesti' },
        { status: 400 }
      )
    }

    // Cerca l'utente nel database
    console.log('Searching for user with email:', email)
    const user = await db.user.findUnique({
      where: { email },
      include: { permessi: true }
    })

    console.log('User found:', !!user)

    if (!user) {
      console.log('Login failed - User not found')
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    // Verifica la password (in produzione usa hash!)
    console.log('Verifying password for user:', user.email)
    if (user.password !== password) {
      console.log('Login failed - Invalid password')
      return NextResponse.json(
        { error: 'Credenziali non valide' },
        { status: 401 }
      )
    }

    console.log('Login successful for user:', user.email)

    // Genera un token semplice (in produzione usa JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    // Rimuovi la password dalla risposta
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: {
        ...userWithoutPassword,
        permessi: user.permessi
      }
    })
  } catch (error: any) {
    console.error('Errore login:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    })
    return NextResponse.json(
      { error: 'Errore durante il login', details: error?.message },
      { status: 500 }
    )
  }
}

