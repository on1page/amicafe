import { db } from '@/lib/db'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Cookie as CookieIcon, Shield, Eye, Trash2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Informativa sui cookie conforme al GDPR',
}

async function getCookiePolicy() {
  const companyData = await db.companyData.findFirst()

  if (!companyData) {
    return {
      content: null,
      lastUpdate: null,
      enabled: true
    }
  }

  // Se l'utente ha inserito una policy personalizzata, usa quella
  if (companyData.cookiesPolicy && companyData.cookiesPolicy.trim() !== '') {
    return {
      content: companyData.cookiesPolicy,
      lastUpdate: companyData.cookiesPolicyUpdate,
      enabled: companyData.cookiesEnabled
    }
  }

  // Altrimenti genera la policy automatica
  const generatedPolicy = generateCookiePolicy(companyData)

  return {
    content: generatedPolicy,
    lastUpdate: companyData.cookiesPolicyUpdate,
    enabled: companyData.cookiesEnabled
  }
}

function generateCookiePolicy(data: any): string {
  const oggi = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const ultimaDataAggiornamento = data.cookiesPolicyUpdate
    ? new Date(data.cookiesPolicyUpdate).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : oggi

  const cookieTecnici = data.cookieTecnici !== false
  const cookieAnalitici = data.cookieAnalitici !== false
  const cookieMarketing = data.cookieMarketing === true

  return `
# Informativa sui Cookie

**Ultimo aggiornamento:** ${ultimaDataAggiornamento}

Questa informativa descrive come questo sito web utilizza i cookie, in conformità con il Regolamento (UE) 2016/679 (GDPR) e la direttiva ePrivacy.

## 1. Cosa sono i Cookie?

I cookie sono piccoli file di testo che vengono scaricati sul tuo dispositivo (computer, smartphone o tablet) quando visiti un sito web. Vengono utilizzati per memorizzare informazioni sulla tua navigazione e per riconoscerti quando torni sul sito.

## 2. Titolare del Trattamento

Il titolare del trattamento dei dati è:

**${data.ragioneSociale || 'Il Nostro Ristorante'}**
${data.indirizzo ? data.indirizzo + ', ' : ''}${data.cap || ''} ${data.citta || ''} ${data.provincia ? `(${data.provincia})` : ''}

**Contatti:**
${data.email ? `- Email: ${data.email}` : ''}
${data.telefono ? `- Telefono: ${data.telefono}` : ''}

## 3. Tipi di Cookie Utilizzati

Questo sito web utilizza i seguenti tipi di cookie:

### 3.1 Cookie Tecnici ${cookieTecnici ? '✅' : '❌'}

I cookie tecnici sono essenziali per il corretto funzionamento del sito e ti permettono di navigare e utilizzare le funzionalità principali. Questi cookie non richiedono il tuo consenso.

**Esempi di cookie tecnici:**
- Cookie di sessione: mantengono lo stato della tua navigazione
- Cookie di autenticazione: permettono l'accesso alle aree riservate
- Cookie di sicurezza: proteggono dal frodi e attacchi
- Cookie di preferenza: memorizzano le tue scelte (lingua, dimensione carattere)

**Durata:** Fino alla chiusura del browser (session cookie) o fino a 12 mesi (persistent cookie)

### 3.2 Cookie Analitici ${cookieAnalitici ? '✅' : '❌'}

${cookieAnalitici ? `
I cookie analitici ci permettono di raccogliere informazioni su come gli utenti utilizzano il sito web. Questi cookie ci aiutano a migliorare le prestazioni e l'usabilità del sito.

**Dati raccolti:**
- Pagine visitate
- Tempo di permanenza sul sito
- Percorso di navigazione
- Dispositivo utilizzato
- Posizione geografica (approssimativa)

**Strumenti utilizzati:**
${data.googleAnalyticsId ? `
- **Google Analytics 4:** Utilizziamo Google Analytics 4 per analizzare il traffico del sito. Google Analytics utilizza cookie per raccogliere dati anonimi sulle visite. I dati vengono trattati in conformità con le policy di privacy di Google. Per maggiori informazioni: [Privacy Policy di Google](https://policies.google.com/privacy)
` : '- Servizi di analytics web (es. Google Analytics)'}

**Durata:** Fino a 14 mesi per Google Analytics 4

**Consenso:** L'uso di questi cookie richiede il tuo consenso esplicito. Puoi revocare il consenso in qualsiasi momento.

**Blocco degli script:** Gli script di analisi vengono caricati solo dopo che hai dato il consenso ai cookie analitici. Se rifiuti, nessuno script di analisi verrà eseguito.
` : `
Attualmente questo sito non utilizza cookie analitici.`}

### 3.3 Cookie di Marketing ${cookieMarketing ? '✅' : '❌'}

${cookieMarketing ? `
I cookie di marketing sono utilizzati per tracciare la tua navigazione e mostrarti pubblicità personalizzata in base alle tue preferenze.

**Dati raccolti:**
- Interessi e preferenze
- Comportamenti di navigazione
- Interazioni con le pubblicità

**Strumenti utilizzati:**
${data.facebookPixelId ? `
- **Facebook Pixel / Meta Pixel:** Utilizziamo il Facebook Pixel per tracciare le conversioni e ottimizzare le campagne pubblicitarie. Meta Platforms raccoglie dati sul comportamento di navigazione per mostrare pubblicità mirata. Per maggiori informazioni: [Privacy Policy di Meta](https://www.facebook.com/privacy/policy/)
` : ''}
${data.amazonTagId ? `
- **Amazon Associates Tag:** Utilizziamo il tag di Amazon Associates per il tracciamento delle vendite e delle commissioni di affiliazione. Amazon può utilizzare cookie per tracciare le attività di affiliazione. Per maggiori informazioni: [Privacy Policy di Amazon](https://www.amazon.it/gp/help/customer/display.html?nodeId=201890250)
` : ''}
${!data.facebookPixelId && !data.amazonTagId ? '- Piattaforme di advertising (es. Google Ads, Facebook Pixel)\n- Servizi di remarketing' : ''}

**Durata:** Fino a 24 mesi per Facebook Pixel, fino a 7 giorni per Amazon Tag

**Consenso:** L'uso di questi cookie richiede il tuo consenso esplicito e puoi revocarlo in qualsiasi momento.

**Blocco degli script:** Gli script di marketing vengono caricati solo dopo che hai dato il consenso ai cookie marketing. Se rifiuti, nessuno script di marketing verrà eseguito.
` : `
Attualmente questo sito non utilizza cookie di marketing.`}

### 3.4 Cookie di Terze Parti

Il sito potrebbe incorporare contenuti di terze parti (es. video, mappe, social network) che utilizzano i propri cookie. Ti invitiamo a consultare le informative sulla privacy di queste terze parti per maggiori informazioni.

**Esempi di servizi di terze parti:**
- Google Maps
- YouTube
- Social network (Facebook, Instagram, X)
- Servizi di pagamento online

## 4. Gestione dei Cookie

### 4.1 Sistema di Consenso Granulare

Questo sito utilizza un sistema di consenso granulare che ti permette di scegliere quali tipi di cookie autorizzare:

- **Cookie Tecnici:** Sempre attivi, essenziali per il funzionamento del sito
- **Cookie Analitici:** Opzionali, richiedono il tuo consenso esplicito
- **Cookie Marketing:** Opzionali, richiedono il tuo consenso esplicito

### 4.2 Accettazione dei Cookie

Alla prima visita del sito, ti verrà mostrato un banner che ti informa sull'uso dei cookie. Hai le seguenti opzioni:

- Cliccando su **"${data.cookieAcceptText || 'Autorizzo'}"**, accetti tutti i tipi di cookie (tecnici, analitici e marketing)
- Cliccando su **"${data.cookieDeclineText || 'Annulla'}"**, autorizzi solo i cookie tecnici essenziali
- Cliccando su **"Personalizza"**, puoi scegliere singolarmente quali tipi di cookie accettare

### 4.3 Modifica delle Preferenze

Puoi modificare le tue preferenze sui cookie in qualsiasi momento:

**Dal browser:**
- Clicca sull'icona delle preferenze dei cookie (solitamente in basso a destra)
- Seleziona o deseleziona i tipi di cookie che desideri autorizzare
- Le modifiche verranno applicate immediatamente

**Cancellando i cookie:**
- Eliminando i cookie dal browser, la tua preferenza verrà azzerata
- Alla prossima visita, ti verrà richiesto di nuovo il consenso

### 4.4 Blocco Reale degli Script

Il nostro sistema garantisce che:

1. Gli script di terze parti (Google Analytics, Facebook Pixel, Amazon) **non vengono caricati** se non hai dato il consenso
2. I cookie di marketing e analitici **non vengono impostati** se non hai dato il consenso
3. Puoi verificare il funzionamento corretto tramite gli strumenti di sviluppo del browser (F12) → Applicazione → Cookie

Questo sistema garantisce la piena conformità al GDPR: non si tratta solo di un banner visivo, ma di un vero blocco tecnico degli script.

### 4.5 Disabilitazione dei Cookie

Puoi gestire o disabilitare i cookie direttamente dal tuo browser. Tieni presente che la disabilitazione dei cookie tecnici potrebbe compromettere il funzionamento corretto del sito.

**Istruzioni per i principali browser:**

**Chrome:**
1. Clicca sui tre punti in alto a destra
2. Seleziona "Impostazioni"
3. Clicca su "Privacy e sicurezza"
4. Clicca su "Cookie e altri dati dei siti"
5. Scegli le tue preferenze

**Firefox:**
1. Clicca sui tre barre in alto a destra
2. Seleziona "Opzioni"
3. Clicca su "Privacy e sicurezza"
4. Vai alla sezione "Cookie e dati dei siti"
5. Scegli le tue preferenze

**Safari:**
1. Clicca su "Safari" nella barra dei menu
2. Seleziona "Preferenze"
3. Clicca su "Privacy"
4. Scegli le tue preferenze sui cookie

**Edge:**
1. Clicca sui tre punti in alto a destra
2. Seleziona "Impostazioni"
3. Clicca su "Cookie e autorizzazioni del sito"
4. Scegli le tue preferenze

### 4.6 Cookie Flash e Local Storage

Questo sito potrebbe utilizzare Local Storage e Session Storage per memorizzare informazioni temporanee necessarie per il funzionamento del sito. Questi meccanismi funzionano in modo simile ai cookie ma non sono gestiti dal browser.

## 7. Periodo di Conservazione dei Cookie

I cookie vengono conservati per diversi periodi di tempo, a seconda del loro tipo:

- **Cookie di sessione:** Vengono eliminati quando chiudi il browser
- **Cookie persistenti:** Vengono conservati per un periodo che varia da 24 mesi a 5 anni
- **Cookie di terze parti:** Il periodo di conservazione è definito dalla terza parte

## 8. I Tuoi Diritti

In conformità con il GDPR, hai i seguenti diritti relativi ai cookie:

1. **Diritto di informazione:** Ricevere informazioni chiare sui cookie utilizzati
2. **Diritto di consenso:** Dare o revocare il consenso all'uso dei cookie
3. **Diritto di accesso:** Richiedere informazioni sui cookie memorizzati sul tuo dispositivo
4. **Diritto di opposizione:** Opporti all'uso di determinati cookie
5. **Diritto di cancellazione:** Richiedere la cancellazione dei cookie dal tuo dispositivo

Per esercitare questi diritti, puoi contattarci all'indirizzo email: **${data.email || 'info@azienda.it'}**

## 9. Aggiornamenti alla Cookie Policy

Ci riserviamo il diritto di modificare questa informativa sui cookie in qualsiasi momento, in caso di cambiamenti nelle normative o nell'uso dei cookie. Le modifiche verranno pubblicate su questa pagina con l'indicazione della data di aggiornamento.

Ti invitiamo a consultare regolarmente questa pagina per essere informato sulle ultime modifiche.

## 10. Ulteriori Informazioni

Per ulteriori informazioni sulla privacy e sul trattamento dei tuoi dati personali, ti invitiamo a consultare la nostra [Privacy Policy](${data.privacyUrl || '/privacy-policy'}).

Se hai domande o dubbi sull'uso dei cookie, puoi contattarci:
${data.email ? `- Email: ${data.email}` : ''}
${data.telefono ? `- Telefono: ${data.telefono}` : ''}

---

**Data di generazione:** ${oggi}
`.trim()
}

export default async function CookiePolicyPage() {
  const { content, enabled } = await getCookiePolicy()

  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <CookieIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cookie Policy Non Disponibile</h1>
          <p className="text-gray-600">La cookie policy è stata disattivata dall'amministratore.</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dati Non Disponibili</h1>
          <p className="text-gray-600">
            Configura i dati aziendali nel pannello admin per generare automaticamente la cookie policy.
          </p>
        </div>
      </div>
    )
  }

  // Converti markdown in sezioni
  const sections = content.split('\n## ')

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <CookieIcon className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Cookie Policy</h1>
              <p className="text-gray-600">Informativa sull'uso dei cookie (GDPR)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {sections.map((section, index) => {
            if (index === 0) {
              // First section doesn't have ## prefix
              return (
                <div key={index} className="prose prose-lg max-w-none">
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
                    <p className="text-gray-700 whitespace-pre-line text-justify">
                      {section}
                    </p>
                  </div>
                </div>
              )
            }

            const [title, ...contentParts] = section.split('\n')
            const sectionContent = contentParts.join('\n')

            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b">
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    {getSectionIcon(index)}
                    {title.replace(/✅|❌/g, '').trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatCookieContent(sectionContent)
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Questa informativa è conforme al Regolamento (UE) 2016/679 (GDPR)
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Per qualsiasi domanda sull'uso dei cookie, contattaci: info@labellatavola.it
          </p>
        </div>
      </div>
    </div>
  )
}

function formatCookieContent(content: string): string {
  let html = content

  // Converti checkboxes
  html = html.replace(/✅/g, '<span class="inline-flex items-center gap-1 text-green-600 font-semibold"><CheckCircle className="w-4 h-4 inline" /> Attivo</span>')
  html = html.replace(/❌/g, '<span class="inline-flex items-center gap-1 text-red-600 font-semibold"><XCircle className="w-4 h-4 inline" /> Non attivo</span>')

  // Bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Convert list items first: - item -> <li>item</li>
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>')

  // Convert numbered lists: 1. item -> <li>item</li>
  html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')

  // Convert paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p class="mt-4 mb-4">')

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*?<\/li>)/g, function(match) {
    return match.replace(/<li>/g, '</p><ul class="list-disc pl-6 mt-4 mb-4"><li>')
  })

  // Fix double </p><ul> sequences
  html = html.replace(/<\/p><ul class="list-disc pl-6 mt-4 mb-4">/g, '<ul class="list-disc pl-6 mt-4 mb-4">')

  // Add closing </ul> before new paragraphs
  html = html.replace(/<\/li><p class="mt-4 mb-4">/g, '</li></ul><p class="mt-4 mb-4">')

  // Fix any remaining <p> tags at start or end
  html = html.replace(/^<p class="mt-4 mb-4">/, '')
  html = html.replace(/<p class="mt-4 mb-4">$/, '')

  // Convert markdown links [text](url) to HTML
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 underline">$1</a>')

  return html
}

function getSectionIcon(index: number) {
  const icons: Record<number, React.ReactNode> = {
    1: <CookieIcon className="w-6 h-6 text-amber-600" />,
    2: <Shield className="w-6 h-6 text-blue-600" />,
    3: <CookieIcon className="w-6 h-6 text-primary" />,
    4: <Eye className="w-6 h-6 text-green-600" />,
    5: <Trash2 className="w-6 h-6 text-red-600" />,
    6: <CheckCircle className="w-6 h-6 text-green-600" />,
    7: <Shield className="w-6 h-6 text-purple-600" />,
    8: <CookieIcon className="w-6 h-6 text-blue-600" />,
    9: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
    10: <CookieIcon className="w-6 h-6 text-primary" />
  }
  return icons[index] || null
}
