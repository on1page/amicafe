import { db } from '@/lib/db'
import { Metadata } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Eye, Trash2, Share2, FileCheck, AlertTriangle, User } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sulla privacy conforme al GDPR',
}

async function getPrivacyPolicy() {
  const companyData = await db.companyData.findFirst()

  if (!companyData) {
    return {
      content: null,
      lastUpdate: null,
      enabled: true
    }
  }

  // Se l'utente ha inserito una policy personalizzata, usa quella
  if (companyData.privacyPolicy && companyData.privacyPolicy.trim() !== '') {
    return {
      content: companyData.privacyPolicy,
      lastUpdate: companyData.privacyPolicyUpdate,
      enabled: companyData.privacyEnabled
    }
  }

  // Altrimenti genera la policy automatica
  const generatedPolicy = generatePrivacyPolicy(companyData)

  return {
    content: generatedPolicy,
    lastUpdate: companyData.privacyPolicyUpdate,
    enabled: companyData.privacyEnabled
  }
}

function generatePrivacyPolicy(data: any): string {
  const oggi = new Date().toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })

  const ultimaDataAggiornamento = data.privacyPolicyUpdate
    ? new Date(data.privacyPolicyUpdate).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    : oggi

  const dpoSection = data.dpoNome || data.dpoEmail ? `
## 10. Data Protection Officer (DPO)

${data.dpoNome ? `Il Data Protection Officer nominato dal Titolare è: **${data.dpoNome}**.` : ''}
${data.dpoEmail ? `Puoi contattare il DPO all'indirizzo email: **${data.dpoEmail}**.` : ''}
${data.dpoIndirizzo ? `Indirizzo del DPO: ${data.dpoIndirizzo}` : ''}` : ''

  return `
# Informativa sulla Privacy

**Ultimo aggiornamento:** ${ultimaDataAggiornamento}

Questa informativa descrive come il sito web raccoglie, utilizza e protegge le informazioni personali degli utenti, in conformità con il Regolamento (UE) 2016/679 (GDPR).

## 1. Titolare del Trattamento

Il titolare del trattamento dei dati è:

**${data.ragioneSociale || 'Il Nostro Ristorante'}**
${data.indirizzo ? data.indirizzo + ', ' : ''}${data.cap || ''} ${data.citta || ''} ${data.provincia ? `(${data.provincia})` : ''}${data.paese ? ', ' + data.paese : ''}

**Contatti:**
${data.telefono ? `- Telefono: ${data.telefono}` : ''}
${data.email ? `- Email: ${data.email}` : ''}
${data.pec ? `- PEC: ${data.pec}` : ''}
${data.partitaIva ? `- Partita IVA: ${data.partitaIva}` : ''}

## 2. Dati Personali Raccolti

Raccogliamo i seguenti tipi di dati personali:

### 2.1 Dati di Navigazione
I sistemi informatici e le procedure software preposte al funzionamento di questo sito acquisiscono, nel corso del loro normale esercizio, alcuni dati personali la cui trasmissione è implicita nell'uso dei protocolli di comunicazione di Internet.

Questi dati includono:
- Indirizzi IP (parzialmente anonimizzati)
- Tipo di browser e sistema operativo
- Orario della richiesta
- Pagine visitate
- Tempo di permanenza sulle pagine

Tali dati sono utilizzati al solo fine di ricavare informazioni statistiche anonime sull'uso del sito e per controllarne il corretto funzionamento. **Tali dati non vengono associati a interessati identificati**, salvo in caso di necessità di accertamento di reati da parte delle autorità competenti.

### 2.2 Dati Forniti Volontariamente dall'Utente
L'utente può fornire volontariamente i seguenti dati personali:
- Nome e cognome
- Indirizzo email
- Numero di telefono
- Dati per prenotazioni (data, ora, numero di persone)
- Altre informazioni inviate tramite moduli di contatto

### 2.3 Cookie e Dati di Tracciamento
Il sito utilizza cookie e tecnologie simili per raccogliere dati di navigazione. Il trattamento di tali dati è disciplinato dalla nostra [Cookie Policy](/cookie-policy) e richiede il consenso dell'utente, secondo le seguenti categorie:

- **Cookie tecnici:** Essenziali per il funzionamento del sito, non richiedono consenso
- **Cookie analitici:** Per analizzare l'utilizzo del sito (es. Google Analytics 4) - richiedono consenso
- **Cookie marketing:** Per finalità pubblicitarie (es. Facebook Pixel, Amazon) - richiedono consenso

Il sistema garantisce che gli script di terze parti vengano caricati solo dopo aver ottenuto il consenso appropriato. In caso di rifiuto, tali script non vengono eseguiti e i cookie non vengono impostati.

## 3. Finalità del Trattamento

I dati personali sono trattati per le seguenti finalità:

### 3.1 Finalità Principali
- **Gestione delle prenotazioni:** Per confermare e gestire le prenotazioni dei tavoli
- **Comunicazione con l'utente:** Per rispondere a richieste di informazioni
- **Invio di comunicazioni:** Per inviare conferme, promemoria e aggiornamenti (con previo consenso)

### 3.2 Finalità Secondarie
- **Analisi e statistiche:** Per analizzare l'utilizzo del sito e migliorare i servizi
- **Marketing:** Per inviare offerte e promozioni (solo con esplicito consenso)

## 4. Base Legale del Trattamento

Il trattamento dei dati personali si basa sulle seguenti basi legali previste dal GDPR:

- **Esecuzione di un contratto:** Per la gestione delle prenotazioni e la fornitura dei servizi richiesti
- **Obbligo legale:** Per adempimenti di legge contabili, fiscali e amministrativi
- **Consenso dell'interessato:** Per il trattamento dei dati per finalità di marketing
- **Interesse legittimo:** Per la protezione della sicurezza del sito e la prevenzione di frodi

## 5. Destinatari dei Dati

I dati personali possono essere comunicati a:

- **Personale interno:** Dipendenti e collaboratori del titolare incaricati del trattamento
- **Fornitori di servizi:** Aziende terze che forniscono servizi tecnici (hosting, email, gestione database)
- **Autorità competenti:** Solo quando richiesto dalla legge per accertamenti o indagini

I dati non saranno diffusi a terzi senza il tuo esplicito consenso, salvo obblighi di legge.

## 6. Servizi di Terze Parti per Cookie

Per il funzionamento di alcuni servizi, questo sito utilizza strumenti di terze parti che possono trattare i tuoi dati. Di seguito forniamo maggiori informazioni su tali servizi:

### 6.1 Google Analytics 4 (se attivo)
Utilizziamo Google Analytics 4 per analizzare il traffico del sito. Google tratta i dati in conformità con la sua privacy policy. Per maggiori informazioni:
- [Privacy Policy di Google](https://policies.google.com/privacy)
- [Impostazioni sulla privacy di Google Ads](https://adssettings.google.com/)

### 6.2 Facebook Pixel / Meta Pixel (se attivo)
Utilizziamo il Facebook Pixel per tracciare le conversioni e ottimizzare le campagne pubblicitarie. Meta Platforms tratta i dati in conformità con la sua privacy policy. Per maggiori informazioni:
- [Privacy Policy di Meta](https://www.facebook.com/privacy/policy/)
- [Impostazioni sulla privacy di Facebook](https://www.facebook.com/settings/?tab=ads)

### 6.3 Amazon Associates Tag (se attivo)
Utilizziamo il tag di Amazon Associates per il tracciamento delle vendite di affiliazione. Amazon tratta i dati in conformità con la sua privacy policy. Per maggiori informazioni:
- [Privacy Policy di Amazon](https://www.amazon.it/gp/help/customer/display.html?nodeId=201890250)

**Nota importante:** Tutti questi servizi vengono attivati solo dopo aver ottenuto il tuo consenso tramite il banner dei cookie. Puoi revocare il consenso in qualsiasi momento dalle impostazioni del browser o dalle preferenze dei cookie del sito.

## 7. Trasferimento Dati all'Estero

I dati personali sono trattati all'interno dell'Unione Europea e non vengono trasferiti in paesi terzi non appartenenti all'UE.

In caso di necessità, il trasferimento avverrà solo verso paesi che garantiscono un livello adeguato di protezione dei dati, in conformità con le disposizioni del GDPR.

## 8. Periodo di Conservazione dei Dati

I dati personali vengono conservati per il tempo necessario al raggiungimento delle finalità per cui sono stati raccolti:

- **Dati di navigazione:** Conservati per 15 giorni, salvo necessità di accertamento di reati
- **Dati delle prenotazioni:** Conservati per 10 anni per adempiere agli obblighi fiscali
- **Dati di contatto:** Conservati per 24 mesi dall'ultima interazione
- **Dati marketing:** Conservati fino alla revoca del consenso

## 9. Diritti dell'Utente

In conformità con il GDPR, hai i seguenti diritti:

1. **Diritto di accesso (Art. 15 GDPR):** Richiedere conferma dell'esistenza dei tuoi dati e l'accesso agli stessi
2. **Diritto di rettifica (Art. 16 GDPR):** Richiedere la correzione di dati inesatti o incompleti
3. **Diritto alla cancellazione (Art. 17 GDPR):** Richiedere la cancellazione dei tuoi dati quando non più necessari
4. **Diritto alla limitazione del trattamento (Art. 18 GDPR):** Richiedere la limitazione del trattamento dei tuoi dati
5. **Diritto alla portabilità (Art. 20 GDPR):** Ricevere i tuoi dati in un formato strutturato e di uso comune
6. **Diritto di opposizione (Art. 21 GDPR):** Opporti al trattamento dei tuoi dati per motivi legittimi
7. **Diritto di revoca del consenso:** Revocare il consenso in qualsiasi momento senza pregiudicare la liceità del trattamento basata sul consenso precedente

Per esercitare questi diritti, puoi contattarci all'indirizzo email: **${data.email || 'info@azienda.it'}**

${dpoSection}

## 11. Modifiche alla Informativa

Ci riserviamo il diritto di modificare questa informativa sulla privacy in qualsiasi momento. Le modifiche verranno pubblicate su questa pagina con l'indicazione della data di aggiornamento.

Ti invitiamo a consultare regolarmente questa pagina per essere informato sulle ultime modifiche.

---

**Data di generazione:** ${oggi}
`.trim()
}

export default async function PrivacyPolicyPage() {
  const { content, enabled } = await getPrivacyPolicy()

  if (!enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy Non Disponibile</h1>
          <p className="text-gray-600">La privacy policy è stata disattivata dall'amministratore.</p>
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
            Configura i dati aziendali nel pannello admin per generare automaticamente la privacy policy.
          </p>
        </div>
      </div>
    )
  }

  // Converti markdown in HTML per il rendering
  const sections = content.split('\n## ')

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-gray-600">Informativa sul trattamento dei dati personali (GDPR)</p>
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
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                  <CardTitle className="text-2xl text-gray-900 flex items-center gap-2">
                    {getSectionIcon(index)}
                    {title.replace(/\*\*/g, '').trim()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatPrivacyContent(sectionContent)
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
            Per qualsiasi domanda sui tuoi dati personali, contattaci: {await db.companyData.findFirst().then(cd => cd?.email || 'info@labellatavola.it')}
          </p>
        </div>
      </div>
    </div>
  )
}

function getSectionIcon(index: number) {
  const icons: Record<number, React.ReactNode> = {
    1: <Shield className="w-6 h-6 text-blue-600" />,
    2: <Eye className="w-6 h-6 text-green-600" />,
    3: <FileCheck className="w-6 h-6 text-purple-600" />,
    4: <Share2 className="w-6 h-6 text-primary" />,
    5: <Trash2 className="w-6 h-6 text-red-600" />,
    6: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
    7: <FileCheck className="w-6 h-6 text-blue-600" />,
    8: <Shield className="w-6 h-6 text-green-600" />,
    9: <User className="w-6 h-6 text-purple-600" />,
    10: <User className="w-6 h-6 text-blue-600" />,
    11: <AlertTriangle className="w-6 h-6 text-primary" />
  }
  return icons[index] || null
}

function formatPrivacyContent(content: string): string {
  // Converti markdown in HTML renderizzabile
  let html = content

  // Bold text: **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

  // Convert numbered lists: 1. text -> <li>text</li>
  html = html.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>')

  // Convert list items: - item -> <li>item</li>
  html = html.replace(/^- (.*?)$/gm, '<li>$1</li>')

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
