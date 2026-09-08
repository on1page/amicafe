'use client'

import { useState, useEffect } from 'react'
import { Save, FileText, Cookie, ShieldCheck, Building2, UserCheck, Settings, Globe, Info, Code } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

interface CompanyData {
  id: string
  ragioneSociale?: string | null
  partitaIva?: string | null
  codiceFiscale?: string | null
  indirizzo?: string | null
  citta?: string | null
  cap?: string | null
  provincia?: string | null
  paese?: string | null
  telefono?: string | null
  email?: string | null
  pec?: string | null
  dpoNome?: string | null
  dpoEmail?: string | null
  dpoIndirizzo?: string | null
  privacyPolicy?: string | null
  privacyEnabled?: boolean | null
  cookiesPolicy?: string | null
  cookiesEnabled?: boolean | null
  cookieTecnici?: boolean | null
  cookieAnalitici?: boolean | null
  cookieMarketing?: boolean | null
  terminiServizio?: string | null
  privacyUrl?: string | null
  cookiesUrl?: string | null
  terminiUrl?: string | null
  showCookieBanner?: boolean | null
  cookieBannerText?: string | null
  cookieAcceptText?: string | null
  cookieDeclineText?: string | null
  privacyPolicyUpdate?: string | null
  cookiesPolicyUpdate?: string | null
  thirdPartyScriptsEnabled?: boolean | null
  googleAnalyticsId?: string | null
  facebookPixelId?: string | null
  amazonTagId?: string | null
  adSenseId?: string | null
  adSenseSlotHorizontal?: string | null
  adSenseSlotRectangle?: string | null
  adSenseSlotTop?: string | null
  adSenseSlotInline?: string | null
}

export default function AdminCompanyData() {
  const [companyData, setCompanyData] = useState<CompanyData>({
    id: '',
    ragioneSociale: '',
    partitaIva: '',
    codiceFiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    provincia: '',
    paese: 'Italia',
    telefono: '',
    email: '',
    pec: '',
    dpoNome: '',
    dpoEmail: '',
    dpoIndirizzo: '',
    privacyPolicy: '',
    privacyEnabled: true,
    cookiesPolicy: '',
    cookiesEnabled: true,
    cookieTecnici: true,
    cookieAnalitici: true,
    cookieMarketing: false,
    terminiServizio: '',
    privacyUrl: '/privacy-policy',
    cookiesUrl: '/cookie-policy',
    terminiUrl: '/termini-servizio',
    showCookieBanner: true,
    cookieBannerText: "Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su 'Autorizzo', accetti l'uso dei cookie.",
    cookieAcceptText: 'Autorizzo',
    cookieDeclineText: 'Annulla',
    thirdPartyScriptsEnabled: true,
    googleAnalyticsId: '',
    facebookPixelId: '',
    amazonTagId: '',
    adSenseId: '',
    adSenseSlotHorizontal: '',
    adSenseSlotRectangle: '',
    adSenseSlotTop: '',
    adSenseSlotInline: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('azienda')

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/company-data');
        if (response.ok) {
          const result = await response.json();
          // Supporta entrambi i formati: { data: {...} } o direttamente i dati
          const data = result.data || result;
          if (isMounted) {
            setCompanyData(data);
          }
        }
      } catch (error) {
        console.error('Errore nel recupero dati aziendali:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });

      if (response.ok) {
        alert('Dati aziendali salvati con successo!');
        fetchData(); // Ricarica i dati aggiornati
      } else {
        alert('Errore nel salvataggio');
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore di connessione');
    } finally {
      setSaving(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/company-data');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setCompanyData(data);
      }
    } catch (error) {
      console.error('Errore nel recupero dati aziendali:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Caricamento dati...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dati Aziendali e Legali</h2>
          <p className="text-sm text-gray-500 mt-1">
            Configura i dati aziendali e le impostazioni GDPR per Privacy e Cookie Policy
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva Dati'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="azienda">
            <Building2 className="w-4 h-4 mr-2" />
            Azienda
          </TabsTrigger>
          <TabsTrigger value="dpo">
            <UserCheck className="w-4 h-4 mr-2" />
            DPO
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="cookies">
            <Cookie className="w-4 h-4 mr-2" />
            Cookie
          </TabsTrigger>
          <TabsTrigger value="scripts">
            <Code className="w-4 h-4 mr-2" />
            Script
          </TabsTrigger>
          <TabsTrigger value="impostazioni">
            <Settings className="w-4 h-4 mr-2" />
            Impostazioni
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[calc(95vh-220px)] mt-6">
          <div className="space-y-6 pr-4">
            {/* Tab Azienda */}
            <TabsContent value="azienda" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Dati Aziendali
                  </CardTitle>
                  <CardDescription>
                    Inserisci le informazioni legali della tua azienda per i documenti GDPR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ragioneSociale">Ragione Sociale *</Label>
                    <Input
                      id="ragioneSociale"
                      value={companyData.ragioneSociale || ''}
                      onChange={(e) => setCompanyData({ ...companyData, ragioneSociale: e.target.value })}
                      placeholder="Es: La Bella Tavola S.r.l."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="partitaIva">Partita IVA *</Label>
                      <Input
                        id="partitaIva"
                        value={companyData.partitaIva || ''}
                        onChange={(e) => setCompanyData({ ...companyData, partitaIva: e.target.value })}
                        placeholder="Es: IT12345678901"
                      />
                    </div>
                    <div>
                      <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                      <Input
                        id="codiceFiscale"
                        value={companyData.codiceFiscale || ''}
                        onChange={(e) => setCompanyData({ ...companyData, codiceFiscale: e.target.value })}
                        placeholder="Es: RSSMRA80A01H501U"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="indirizzo">Indirizzo</Label>
                    <Input
                      id="indirizzo"
                      value={companyData.indirizzo || ''}
                      onChange={(e) => setCompanyData({ ...companyData, indirizzo: e.target.value })}
                      placeholder="Es: Via Roma 123"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cap">CAP</Label>
                      <Input
                        id="cap"
                        value={companyData.cap || ''}
                        onChange={(e) => setCompanyData({ ...companyData, cap: e.target.value })}
                        placeholder="00100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="citta">Città *</Label>
                      <Input
                        id="citta"
                        value={companyData.citta || ''}
                        onChange={(e) => setCompanyData({ ...companyData, citta: e.target.value })}
                        placeholder="Es: Milano"
                      />
                    </div>
                    <div>
                      <Label htmlFor="provincia">Provincia</Label>
                      <Input
                        id="provincia"
                        value={companyData.provincia || ''}
                        onChange={(e) => setCompanyData({ ...companyData, provincia: e.target.value })}
                        placeholder="Es: MI"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="paese">Paese</Label>
                    <Input
                      id="paese"
                      value={companyData.paese || 'Italia'}
                      onChange={(e) => setCompanyData({ ...companyData, paese: e.target.value })}
                      placeholder="Es: Italia"
                    />
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="telefono">Telefono</Label>
                      <Input
                        id="telefono"
                        value={companyData.telefono || ''}
                        onChange={(e) => setCompanyData({ ...companyData, telefono: e.target.value })}
                        placeholder="+39 02 1234567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={companyData.email || ''}
                        onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                        placeholder="info@azienda.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pec">PEC</Label>
                      <Input
                        id="pec"
                        type="email"
                        value={companyData.pec || ''}
                        onChange={(e) => setCompanyData({ ...companyData, pec: e.target.value })}
                        placeholder="pec@azienda.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab DPO */}
            <TabsContent value="dpo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Data Protection Officer (DPO)
                  </CardTitle>
                  <CardDescription>
                    Indica il responsabile della protezione dei dati, se richiesto dal GDPR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Chi deve avere un DPO?</p>
                        <p>Il DPO è obbligatorio se: (a) trattamenti su larga scala, (b) dati sensibili o giudiziari, 
                        (c) monitoraggio sistematico di persone, oppure è richiesto dalle autorità.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dpoNome">Nome e Cognome del DPO</Label>
                    <Input
                      id="dpoNome"
                      value={companyData.dpoNome || ''}
                      onChange={(e) => setCompanyData({ ...companyData, dpoNome: e.target.value })}
                      placeholder="Es: Mario Rossi"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dpoEmail">Email del DPO</Label>
                    <Input
                      id="dpoEmail"
                      type="email"
                      value={companyData.dpoEmail || ''}
                      onChange={(e) => setCompanyData({ ...companyData, dpoEmail: e.target.value })}
                      placeholder="dpo@azienda.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dpoIndirizzo">Indirizzo del DPO</Label>
                    <Input
                      id="dpoIndirizzo"
                      value={companyData.dpoIndirizzo || ''}
                      onChange={(e) => setCompanyData({ ...companyData, dpoIndirizzo: e.target.value })}
                      placeholder="Es: Via della Privacy 1, Milano"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Privacy */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    Privacy Policy
                  </CardTitle>
                  <CardDescription>
                    Configura la Privacy Policy conforme al GDPR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Abilita Privacy Policy</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Mostra la pagina Privacy Policy e il link nel footer
                      </p>
                    </div>
                    <Switch
                      checked={companyData.privacyEnabled ?? true}
                      onCheckedChange={(checked) => setCompanyData({ ...companyData, privacyEnabled: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="privacyUrl">URL Privacy Policy</Label>
                    <Input
                      id="privacyUrl"
                      value={companyData.privacyUrl || '/privacy-policy'}
                      onChange={(e) => setCompanyData({ ...companyData, privacyUrl: e.target.value })}
                      placeholder="/privacy-policy"
                    />
                  </div>

                  <div>
                    <Label htmlFor="privacyPolicy">Testo Privacy Policy (opzionale)</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Se lasciato vuoto, verrà generato automaticamente un template GDPR-compliant
                    </p>
                    <Textarea
                      id="privacyPolicy"
                      value={companyData.privacyPolicy || ''}
                      onChange={(e) => setCompanyData({ ...companyData, privacyPolicy: e.target.value })}
                      rows={10}
                      placeholder="Inserisci il testo personalizzato della privacy policy..."
                      className="font-mono text-sm"
                    />
                  </div>

                  {companyData.privacyPolicyUpdate && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                      Ultimo aggiornamento: {new Date(companyData.privacyPolicyUpdate).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Cookies */}
            <TabsContent value="cookies" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cookie className="w-5 h-5 text-amber-600" />
                    Cookie Policy
                  </CardTitle>
                  <CardDescription>
                    Configura i cookie e la Cookie Policy conforme al GDPR
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Abilita Cookie Policy</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Mostra la pagina Cookie Policy e il link nel footer
                      </p>
                    </div>
                    <Switch
                      checked={companyData.cookiesEnabled ?? true}
                      onCheckedChange={(checked) => setCompanyData({ ...companyData, cookiesEnabled: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cookiesUrl">URL Cookie Policy</Label>
                    <Input
                      id="cookiesUrl"
                      value={companyData.cookiesUrl || '/cookie-policy'}
                      onChange={(e) => setCompanyData({ ...companyData, cookiesUrl: e.target.value })}
                      placeholder="/cookie-policy"
                    />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-base font-semibold">Tipi di Cookie Utilizzati</Label>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Cookie Tecnici</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Essenziali per il funzionamento del sito (es. autenticazione, carrello)
                        </p>
                      </div>
                      <Switch
                        checked={companyData.cookieTecnici ?? true}
                        onCheckedChange={(checked) => setCompanyData({ ...companyData, cookieTecnici: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Cookie Analitici</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Per analizzare l'utilizzo del sito e migliorare le prestazioni (es. Google Analytics)
                        </p>
                      </div>
                      <Switch
                        checked={companyData.cookieAnalitici ?? true}
                        onCheckedChange={(checked) => setCompanyData({ ...companyData, cookieAnalitici: checked })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Label className="font-medium">Cookie di Marketing</Label>
                        <p className="text-sm text-gray-500 mt-1">
                          Per inviare pubblicità personalizzata (es. retargeting, social media)
                        </p>
                      </div>
                      <Switch
                        checked={companyData.cookieMarketing ?? false}
                        onCheckedChange={(checked) => setCompanyData({ ...companyData, cookieMarketing: checked })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cookiesPolicy">Testo Cookie Policy (opzionale)</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Se lasciato vuoto, verrà generato automaticamente un template GDPR-compliant
                    </p>
                    <Textarea
                      id="cookiesPolicy"
                      value={companyData.cookiesPolicy || ''}
                      onChange={(e) => setCompanyData({ ...companyData, cookiesPolicy: e.target.value })}
                      rows={10}
                      placeholder="Inserisci il testo personalizzato della cookie policy..."
                      className="font-mono text-sm"
                    />
                  </div>

                  {companyData.cookiesPolicyUpdate && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                      Ultimo aggiornamento: {new Date(companyData.cookiesPolicyUpdate).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Script di Terze Parti */}
            <TabsContent value="scripts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-indigo-600" />
                    Script di Terze Parti
                  </CardTitle>
                  <CardDescription>
                    Configura gli ID per gli script di tracking e marketing (Google Analytics, Facebook Pixel, Amazon, AdSense)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Abilita Script di Terze Parti</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Carica gli script solo se l'utente ha dato il consenso appropriato
                      </p>
                    </div>
                    <Switch
                      checked={companyData.thirdPartyScriptsEnabled ?? true}
                      onCheckedChange={(checked) => setCompanyData({ ...companyData, thirdPartyScriptsEnabled: checked })}
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">GDPR-Compliant</p>
                        <p>Questi script vengono caricati solo dopo che l'utente ha dato il consenso appropriato:
                        Google Analytics richiede cookie analitici, Facebook Pixel, Amazon e AdSense richiedono cookie marketing.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label htmlFor="googleAnalyticsId" className="flex items-center gap-2">
                        <span className="font-semibold">📊 Google Analytics 4</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Cookie Analitici</span>
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Inserisci il tuo GA4 Measurement ID (es: G-XXXXXXXXXX)
                      </p>
                      <Input
                        id="googleAnalyticsId"
                        value={companyData.googleAnalyticsId || ''}
                        onChange={(e) => setCompanyData({ ...companyData, googleAnalyticsId: e.target.value })}
                        placeholder="G-XXXXXXXXXX"
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebookPixelId" className="flex items-center gap-2">
                        <span className="font-semibold">🎯 Facebook Pixel / Meta Pixel</span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Cookie Marketing</span>
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Inserisci il tuo Facebook Pixel ID (es: 123456789012345)
                      </p>
                      <Input
                        id="facebookPixelId"
                        value={companyData.facebookPixelId || ''}
                        onChange={(e) => setCompanyData({ ...companyData, facebookPixelId: e.target.value })}
                        placeholder="123456789012345"
                        className="font-mono"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amazonTagId" className="flex items-center gap-2">
                        <span className="font-semibold">🛒 Amazon Associates Tag</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Cookie Marketing</span>
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Inserisci il tuo Amazon Associate Tag ID (es: tuoazienda-20)
                      </p>
                      <Input
                        id="amazonTagId"
                        value={companyData.amazonTagId || ''}
                        onChange={(e) => setCompanyData({ ...companyData, amazonTagId: e.target.value })}
                        placeholder="tuoazienda-20"
                        className="font-mono"
                      />
                    </div>

                    <div className="pt-4 border-t">
                      <Label htmlFor="adSenseId" className="flex items-center gap-2">
                        <span className="font-semibold">💰 Google AdSense - Publisher ID</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Cookie Marketing</span>
                      </Label>
                      <p className="text-sm text-gray-500 mb-2">
                        Inserisci il tuo Publisher ID di Google AdSense (formato completo: ca-pub-XXXXXXXXXXXXXXXX)
                      </p>
                      <Input
                        id="adSenseId"
                        value={companyData.adSenseId || ''}
                        onChange={(e) => setCompanyData({ ...companyData, adSenseId: e.target.value })}
                        placeholder="ca-pub-1234567890123456"
                        className="font-mono"
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Esempio: <code className="bg-gray-100 px-1 rounded">ca-pub-1234567890123456</code>
                      </p>
                    </div>

                    <div className="pt-4 border-t bg-green-50 rounded-lg p-4">
                      <Label className="flex items-center gap-2 mb-4">
                        <span className="font-semibold">📦 AdSense Slot IDs</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Banner Pubblicitari</span>
                      </Label>
                      <p className="text-sm text-gray-600 mb-4">
                        Inserisci gli ID Slot creati nel tuo account AdSense per ciascun tipo di banner. 
                        Questi ID si trovano nella dashboard AdSense under "Unità pubblicitarie".
                      </p>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="adSenseSlotHorizontal" className="text-sm font-medium">Slot Banner Orizzontale</Label>
                          <p className="text-xs text-gray-500 mb-2">Per banner a tutta larghezza (es: 728x90px)</p>
                          <Input
                            id="adSenseSlotHorizontal"
                            value={companyData.adSenseSlotHorizontal || ''}
                            onChange={(e) => setCompanyData({ ...companyData, adSenseSlotHorizontal: e.target.value })}
                            placeholder="1234567890"
                            className="font-mono text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="adSenseSlotRectangle" className="text-sm font-medium">Slot Banner Rettangolare</Label>
                          <p className="text-xs text-gray-500 mb-2">Per banner quadrati o rettangolari (es: 300x250px)</p>
                          <Input
                            id="adSenseSlotRectangle"
                            value={companyData.adSenseSlotRectangle || ''}
                            onChange={(e) => setCompanyData({ ...companyData, adSenseSlotRectangle: e.target.value })}
                            placeholder="1234567890"
                            className="font-mono text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="adSenseSlotTop" className="text-sm font-medium">Slot Banner Top</Label>
                          <p className="text-xs text-gray-500 mb-2">Per banner in alto alla pagina</p>
                          <Input
                            id="adSenseSlotTop"
                            value={companyData.adSenseSlotTop || ''}
                            onChange={(e) => setCompanyData({ ...companyData, adSenseSlotTop: e.target.value })}
                            placeholder="1234567890"
                            className="font-mono text-sm"
                          />
                        </div>

                        <div>
                          <Label htmlFor="adSenseSlotInline" className="text-sm font-medium">Slot Banner Inline</Label>
                          <p className="text-xs text-gray-500 mb-2">Per banner inseriti nel contenuto della pagina</p>
                          <Input
                            id="adSenseSlotInline"
                            value={companyData.adSenseSlotInline || ''}
                            onChange={(e) => setCompanyData({ ...companyData, adSenseSlotInline: e.target.value })}
                            placeholder="1234567890"
                            className="font-mono text-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-4 bg-white rounded p-3 border border-green-200">
                        <p className="text-xs text-gray-600">
                          <strong>Dove trovo gli Slot IDs?</strong> Vai su <a href="https://adsense.google.com" target="_blank" rel="noopener noreferrer" className="text-green-600 underline">Google AdSense</a> → Contenuti → Unità pubblicitarie → clicca sull'unità desiderata → copia il "ID dati" che inizia con un numero.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-semibold mb-1">Come Testare</p>
                          <ol className="list-decimal list-inside space-y-1 mt-1">
                            <li>Inserisci gli ID/Tag nei campi sopra</li>
                            <li>Clicca "Salva Dati"</li>
                            <li>Resetta il consenso cookie dal tab "Impostazioni"</li>
                            <li>Dai il consenso appropriato nel banner (Marketing per AdSense)</li>
                            <li>Apri la console (F12) per vedere i log di caricamento</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Impostazioni */}
            <TabsContent value="impostazioni" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    Banner Cookie
                  </CardTitle>
                  <CardDescription>
                    Configura il banner di consenso cookie che appare all'accesso del sito
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="text-base font-semibold">Mostra Banner Cookie</Label>
                      <p className="text-sm text-gray-500 mt-1">
                        Il banner apparirà agli utenti che non hanno ancora dato il consenso
                      </p>
                    </div>
                    <Switch
                      checked={companyData.showCookieBanner ?? true}
                      onCheckedChange={(checked) => setCompanyData({ ...companyData, showCookieBanner: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cookieBannerText">Testo del Banner</Label>
                    <Textarea
                      id="cookieBannerText"
                      value={companyData.cookieBannerText || ''}
                      onChange={(e) => setCompanyData({ ...companyData, cookieBannerText: e.target.value })}
                      rows={3}
                      placeholder="Inserisci il testo che appare nel banner..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cookieAcceptText">Testo Pulsante "Autorizzo"</Label>
                      <Input
                        id="cookieAcceptText"
                        value={companyData.cookieAcceptText || 'Autorizzo'}
                        onChange={(e) => setCompanyData({ ...companyData, cookieAcceptText: e.target.value })}
                        placeholder="Autorizzo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cookieDeclineText">Testo Pulsante "Annulla"</Label>
                      <Input
                        id="cookieDeclineText"
                        value={companyData.cookieDeclineText || 'Annulla'}
                        onChange={(e) => setCompanyData({ ...companyData, cookieDeclineText: e.target.value })}
                        placeholder="Annulla"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-primary">
                          <p className="font-semibold mb-1">Test del Banner Cookie</p>
                          <p>Usa questi strumenti per testare il banner senza dover cancellare manualmente il localStorage.</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            localStorage.removeItem('cookie-consent')
                            localStorage.removeItem('cookie-consent-date')
                            window.location.reload()
                          }}
                          className="border-primary/30 text-primary hover:bg-primary/10"
                        >
                          Resetta Consenso e Ricarica
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            const consent = localStorage.getItem('cookie-consent')
                            const date = localStorage.getItem('cookie-consent-date')
                            alert(`Consenso attuale: ${consent || 'Nessuno'}\nData: ${date || 'Nessuna'}`)
                          }}
                        >
                          Verifica Stato Consenso
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-600" />
                    Termini di Servizio
                  </CardTitle>
                  <CardDescription>
                    Configura i termini di servizio del sito (opzionale)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="terminiUrl">URL Termini di Servizio</Label>
                    <Input
                      id="terminiUrl"
                      value={companyData.terminiUrl || '/termini-servizio'}
                      onChange={(e) => setCompanyData({ ...companyData, terminiUrl: e.target.value })}
                      placeholder="/termini-servizio"
                    />
                  </div>

                  <div>
                    <Label htmlFor="terminiServizio">Testo Termini di Servizio</Label>
                    <Textarea
                      id="terminiServizio"
                      value={companyData.terminiServizio || ''}
                      onChange={(e) => setCompanyData({ ...companyData, terminiServizio: e.target.value })}
                      rows={8}
                      placeholder="Inserisci i termini di servizio..."
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}