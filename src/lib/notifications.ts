import nodemailer from 'nodemailer'
import type { Twilio as TwilioClient } from 'twilio'

// Interfaccia per i dati della prenotazione
export interface ReservationNotificationData {
  nome: string
  cognome: string
  email: string
  telefono: string
  data: string
  ora: string
  persone: number
  stato: string
  note?: string | null
}

// Configurazione email
const emailConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
}

// Crea transporter email (verifica se è configurato)
const createEmailTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn('⚠️ Email non configurata. Imposta SMTP_USER e SMTP_PASSWORD nel file .env')
    return null
  }

  return nodemailer.createTransport(emailConfig)
}

// Crea client Twilio (verifica se è configurato)
const createTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.warn('⚠️ WhatsApp non configurato. Imposta TWILIO_ACCOUNT_SID e TWILIO_AUTH_TOKEN nel file .env')
    return null
  }

  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

// Genera il messaggio in base allo stato
const getMessageForStatus = (stato: string, data: ReservationNotificationData): { subject: string; text: string; html: string } => {
  const nomeCompleto = `${data.nome} ${data.cognome}`
  const dataFormattata = new Date(data.data).toLocaleDateString('it-IT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  const messages: Record<string, { subject: string; text: string; html: string }> = {
    confirmed: {
      subject: '✅ Prenotazione Confermata - Il Nostro Ristorante',
      text: `Ciao ${nomeCompleto}!\n\nLa tua prenotazione è stata confermata!\n\n📅 Data: ${dataFormattata}\n⏰ Ora: ${data.ora}\n👥 Persone: ${data.persone}\n\nTi aspettiamo! A presto!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">✅ Prenotazione Confermata!</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333;">Ciao <strong>${nomeCompleto}</strong>!</p>
            <p style="font-size: 16px; color: #666; margin: 20px 0;">La tua prenotazione è stata confermata! Ti aspettiamo con grande piacere.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📋 Dettagli Prenotazione</h3>
              <p style="margin: 10px 0; color: #666;"><strong>📅 Data:</strong> ${dataFormattata}</p>
              <p style="margin: 10px 0; color: #666;"><strong>⏰ Ora:</strong> ${data.ora}</p>
              <p style="margin: 10px 0; color: #666;"><strong>👥 Numero Persone:</strong> ${data.persone}</p>
              ${data.note ? `<p style="margin: 10px 0; color: #666;"><strong>📝 Note:</strong> ${data.note}</p>` : ''}
            </div>
            <p style="text-align: center; margin: 30px 0; color: #666;">A presto! 🍽️</p>
          </div>
        </div>
      `
    },
    cancelled: {
      subject: '❌ Prenotazione Cancellata - Il Nostro Ristorante',
      text: `Ciao ${nomeCompleto}.\n\nLa tua prenotazione è stata cancellata.\n\n📅 Data: ${dataFormattata}\n⏰ Ora: ${data.ora}\n👥 Persone: ${data.persone}\n\nSperiamo di vederti presto!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">❌ Prenotazione Cancellata</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 18px; color: #333;">Ciao <strong>${nomeCompleto}</strong>.</p>
            <p style="font-size: 16px; color: #666; margin: 20px 0;">La tua prenotazione è stata cancellata. Se hai domande, contattaci pure.</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
              <h3 style="margin: 0 0 15px 0; color: #333;">📋 Dettagli Prenotazione</h3>
              <p style="margin: 10px 0; color: #666;"><strong>📅 Data:</strong> ${dataFormattata}</p>
              <p style="margin: 10px 0; color: #666;"><strong>⏰ Ora:</strong> ${data.ora}</p>
              <p style="margin: 10px 0; color: #666;"><strong>👥 Numero Persone:</strong> ${data.persone}</p>
            </div>
            <p style="text-align: center; margin: 30px 0; color: #666;">Speriamo di vederti presto! 🍽️</p>
          </div>
        </div>
      `
    }
  }

  return messages[stato as keyof typeof messages] || messages.confirmed
}

// Invia email
export async function sendEmailNotification(
  data: ReservationNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = createEmailTransporter()
    if (!transporter) {
      return { success: false, error: 'Email non configurata' }
    }

    const { subject, text, html } = getMessageForStatus(data.stato, data)

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: data.email,
      subject,
      text,
      html,
    })

    console.log('✅ Email inviata:', info.messageId)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore invio email:', error)
    return { success: false, error: error.message }
  }
}

// Invia messaggio WhatsApp
export async function sendWhatsAppNotification(
  data: ReservationNotificationData
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = createTwilioClient()
    if (!client) {
      return { success: false, error: 'WhatsApp non configurato' }
    }

    if (!process.env.TWILIO_WHATSAPP_NUMBER) {
      return { success: false, error: 'Numero WhatsApp non configurato' }
    }

    const nomeCompleto = `${data.nome} ${data.cognome}`
    const dataFormattata = new Date(data.data).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    let message = ''
    if (data.stato === 'confirmed') {
      message = `✅ *Prenotazione Confermata!*\n\nCiao ${nomeCompleto}!\n\n📅 Data: ${dataFormattata}\n⏰ Ora: ${data.ora}\n👥 Persone: ${data.persone}\n\nTi aspettiamo! 🍽️`
    } else if (data.stato === 'cancelled') {
      message = `❌ *Prenotazione Cancellata*\n\nCiao ${nomeCompleto}.\n\nLa tua prenotazione per ${dataFormattata} alle ${data.ora} è stata cancellata.\n\nSperiamo di vederti presto! 🍽️`
    }

    // Formatta il numero (aggiungi prefisso se necessario)
    let whatsappNumber = data.telefono.replace(/\D/g, '') // Rimuove tutti i caratteri non numerici

    // Se il numero non ha prefisso internazionale, aggiungi +39 (Italia)
    if (!whatsappNumber.startsWith('00') && !whatsappNumber.startsWith('+')) {
      whatsappNumber = '+39' + whatsappNumber
    } else if (whatsappNumber.startsWith('00')) {
      whatsappNumber = '+' + whatsappNumber.substring(2)
    }

    const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER

    await client.messages.create({
      from: twilioNumber,
      to: `whatsapp:${whatsappNumber}`,
      body: message,
    })

    console.log('✅ WhatsApp inviato a:', whatsappNumber)
    return { success: true }
  } catch (error: any) {
    console.error('❌ Errore invio WhatsApp:', error)
    return { success: false, error: error.message }
  }
}

// Invia tutte le notifiche (email + WhatsApp)
export async function sendAllNotifications(
  data: ReservationNotificationData
): Promise<{ email: { success: boolean; error?: string }; whatsapp: { success: boolean; error?: string } }> {
  console.log(`📤 Invio notifiche per prenotazione di ${data.nome} ${data.cognome} - Stato: ${data.stato}`)

  // Invia email e WhatsApp in parallelo
  const [emailResult, whatsappResult] = await Promise.all([
    sendEmailNotification(data),
    sendWhatsAppNotification(data),
  ])

  console.log('📤 Risultati notifiche:', { email: emailResult, whatsapp: whatsappResult })

  return {
    email: emailResult,
    whatsapp: whatsappResult,
  }
}