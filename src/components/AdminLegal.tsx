'use client'

import { useState, useEffect } from 'react'
import { Save, Building2, User, Cookie as CookieIcon, Shield, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

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
  privacyEnabled?: boolean
  cookiesPolicy?: string | null
  cookiesEnabled?: boolean
  cookieTecnici?: boolean
  cookieAnalitici?: boolean
  cookieMarketing?: boolean
  terminiServizio?: string | null
  privacyUrl?: string | null
  cookiesUrl?: string | null
  terminiUrl?: string | null
  showCookieBanner?: boolean
  cookieBannerText?: string | null
  cookieAcceptText?: string | null
  cookieDeclineText?: string | null
}

export default function AdminLegal() {
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
    terminiUrl: '/termini',
    showCookieBanner: true,
    cookieBannerText: "Questo sito utilizza cookie tecnici e analitici per migliorare la tua esperienza di navigazione. Cliccando su 'Autorizzo', accetti l'uso dei cookie.",
    cookieAcceptText: "Autorizzo",
    cookieDeclineText: "Annulla"
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/company-data')
      if (res.ok) {
        const data = await res.json()
        setCompanyData(data)
      }
    } catch (error) {
      console.error('Errore nel recupero dati:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveData() {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      })

      if (response.ok) {
        alert('Dati legali salvati con successo!')
      } else {
        const errorData = await response.json()
        alert(`Errore nel salvataggio:\n${errorData.error}\n\nDettagli: ${errorData.details}`)
      }
    } catch (error) {
      console.error('Errore salvataggio:', error)
      alert(`Errore di rete o server:\n${error instanceof Error ? error.message : 'Errore sconosciuto'}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Caricamento...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Privacy & Cookie
        </h2>
        <Button onClick={saveData} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Salvataggio...' : 'Salva'}
        </Button>
      </div>

      <Tabs defaultValue="azienda" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="azienda">Azienda</TabsTrigger>
          <TabsTrigger value="dpo">DPO</TabsTrigger>
          <TabsTrigger value="cookie">Cookie</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
        </TabsList>

        {/* Azienda */}
        <TabsContent value="azienda" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Dati Aziendali
              </CardTitle>
              <CardDescription>Inserisci i dati della tua azienda per le policy legali</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Ragione Sociale *</Label>
                  <Input
                    value={companyData.ragioneSociale || ''}
                    onChange={(e) => setCompanyData({ ...companyData, ragioneSociale: e.target.value })}
                    placeholder="Es. Ristorante S.r.l."
                  />
                </div>
                <div>
                  <Label>Partita IVA *</Label>
                  <Input
                    value={companyData.partitaIva || ''}
                    onChange={(e) => setCompanyData({ ...companyData, partitaIva: e.target.value })}
                    placeholder="Es. IT12345678901"
                  />
                </div>
                <div>
                  <Label>Codice Fiscale</Label>
                  <Input
                    value={companyData.codiceFiscale || ''}
                    onChange={(e) => setCompanyData({ ...companyData, codiceFiscale: e.target.value })}
                    placeholder="Es. RSSMRA80A01H501U"
                  />
                </div>
                <div>
                  <Label>PEC</Label>
                  <Input
                    value={companyData.pec || ''}
                    onChange={(e) => setCompanyData({ ...companyData, pec: e.target.value })}
                    placeholder="pec@azienda.it"
                    type="email"
                  />
                </div>
              </div>

              <div>
                <Label>Indirizzo *</Label>
                <Input
                  value={companyData.indirizzo || ''}
                  onChange={(e) => setCompanyData({ ...companyData, indirizzo: e.target.value })}
                  placeholder="Via Roma 123"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>Città *</Label>
                  <Input
                    value={companyData.citta || ''}
                    onChange={(e) => setCompanyData({ ...companyData, citta: e.target.value })}
                    placeholder="Milano"
                  />
                </div>
                <div>
                  <Label>CAP *</Label>
                  <Input
                    value={companyData.cap || ''}
                    onChange={(e) => setCompanyData({ ...companyData, cap: e.target.value })}
                    placeholder="20121"
                  />
                </div>
                <div>
                  <Label>Provincia *</Label>
                  <Input
                    value={companyData.provincia || ''}
                    onChange={(e) => setCompanyData({ ...companyData, provincia: e.target.value })}
                    placeholder="MI"
                  />
                </div>
                <div>
                  <Label>Paese</Label>
                  <Input
                    value={companyData.paese || ''}
                    onChange={(e) => setCompanyData({ ...companyData, paese: e.target.value })}
                    placeholder="Italia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefono *</Label>
                  <Input
                    value={companyData.telefono || ''}
                    onChange={(e) => setCompanyData({ ...companyData, telefono: e.target.value })}
                    placeholder="+39 02 1234 5678"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    value={companyData.email || ''}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                    placeholder="info@azienda.it"
                    type="email"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DPO */}
        <TabsContent value="dpo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Data Protection Officer (DPO)
              </CardTitle>
              <CardDescription>
                Se la tua azienda non ha un DPO, puoi lasciare questi campi vuoti
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome DPO</Label>
                <Input
                  value={companyData.dpoNome || ''}
                  onChange={(e) => setCompanyData({ ...companyData, dpoNome: e.target.value })}
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <Label>Email DPO</Label>
                <Input
                  value={companyData.dpoEmail || ''}
                  onChange={(e) => setCompanyData({ ...companyData, dpoEmail: e.target.value })}
                  placeholder="dpo@azienda.it"
                  type="email"
                />
              </div>
              <div>
                <Label>Indirizzo DPO</Label>
                <Textarea
                  value={companyData.dpoIndirizzo || ''}
                  onChange={(e) => setCompanyData({ ...companyData, dpoIndirizzo: e.target.value })}
                  rows={3}
                  placeholder="Indirizzo completo del DPO"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cookie Banner */}
        <TabsContent value="cookie" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CookieIcon className="w-5 h-5" />
                Banner Cookie
              </CardTitle>
              <CardDescription>
                Configura il banner di consenso cookie che appare ai visitatori
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base font-medium">Mostra Banner Cookie</Label>
                  <p className="text-sm text-gray-600 mt-1">
                    Attiva o disattiva il banner di consenso cookie
                  </p>
                </div>
                <Switch
                  checked={companyData.showCookieBanner}
                  onCheckedChange={(checked) => setCompanyData({ ...companyData, showCookieBanner: checked })}
                />
              </div>

              <div>
                <Label>Testo del Banner</Label>
                <Textarea
                  value={companyData.cookieBannerText || ''}
                  onChange={(e) => setCompanyData({ ...companyData, cookieBannerText: e.target.value })}
                  rows={3}
                  placeholder="Messaggio da mostrare nel banner cookie"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Testo Bottone "Autorizzo"</Label>
                  <Input
                    value={companyData.cookieAcceptText || ''}
                    onChange={(e) => setCompanyData({ ...companyData, cookieAcceptText: e.target.value })}
                    placeholder="Autorizzo"
                  />
                </div>
                <div>
                  <Label>Testo Bottone "Annulla"</Label>
                  <Input
                    value={companyData.cookieDeclineText || ''}
                    onChange={(e) => setCompanyData({ ...companyData, cookieDeclineText: e.target.value })}
                    placeholder="Annulla"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <Label className="text-base font-medium">Tipi di Cookie Utilizzati</Label>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <Label className="font-medium">Cookie Tecnici</Label>
                    <p className="text-sm text-gray-600">Essenziali per il funzionamento del sito</p>
                  </div>
                  <Switch
                    checked={companyData.cookieTecnici}
                    onCheckedChange={(checked) => setCompanyData({ ...companyData, cookieTecnici: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <Label className="font-medium">Cookie Analitici</Label>
                    <p className="text-sm text-gray-600">Per analizzare le visite al sito</p>
                  </div>
                  <Switch
                    checked={companyData.cookieAnalitici}
                    onCheckedChange={(checked) => setCompanyData({ ...companyData, cookieAnalitici: checked })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <Label className="font-medium">Cookie Marketing</Label>
                    <p className="text-sm text-gray-600">Per finalità di marketing e profilazione</p>
                  </div>
                  <Switch
                    checked={companyData.cookieMarketing}
                    onCheckedChange={(checked) => setCompanyData({ ...companyData, cookieMarketing: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Policy */}
        <TabsContent value="policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Privacy & Cookie Policy
              </CardTitle>
              <CardDescription>
                Puoi inserire il testo personalizzato delle policy o usare i template automatici
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Nota importante</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Se lasci vuoti i campi "Privacy Policy" e "Cookie Policy", verranno generati automaticamente
                      i template GDPR-compliant utilizzando i dati inseriti nelle altre schede.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Privacy Policy (Personalizzata)</Label>
                    <Switch
                      checked={companyData.privacyEnabled}
                      onCheckedChange={(checked) => setCompanyData({ ...companyData, privacyEnabled: checked })}
                    />
                  </div>
                  <Textarea
                    value={companyData.privacyPolicy || ''}
                    onChange={(e) => setCompanyData({ ...companyData, privacyPolicy: e.target.value })}
                    rows={10}
                    placeholder="Inserisci qui la tua Privacy Policy personalizzata, oppure lascia vuoto per usare il template automatico"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Lascia vuoto per generare automaticamente la Privacy Policy GDPR-compliant
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Cookie Policy (Personalizzata)</Label>
                    <Switch
                      checked={companyData.cookiesEnabled}
                      onCheckedChange={(checked) => setCompanyData({ ...companyData, cookiesEnabled: checked })}
                    />
                  </div>
                  <Textarea
                    value={companyData.cookiesPolicy || ''}
                    onChange={(e) => setCompanyData({ ...companyData, cookiesPolicy: e.target.value })}
                    rows={10}
                    placeholder="Inserisci qui la tua Cookie Policy personalizzata, oppure lascia vuoto per usare il template automatico"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Lascia vuoto per generare automaticamente la Cookie Policy GDPR-compliant
                  </p>
                </div>

                <div>
                  <Label>Termini di Servizio</Label>
                  <Textarea
                    value={companyData.terminiServizio || ''}
                    onChange={(e) => setCompanyData({ ...companyData, terminiServizio: e.target.value })}
                    rows={8}
                    placeholder="Inserisci qui i Termini di Servizio"
                    className="font-mono text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
