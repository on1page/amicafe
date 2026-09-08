'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface CompanyData {
  id: string;
  ragioneSociale?: string;
  partitaIva?: string;
  codiceFiscale?: string;
  indirizzo?: string;
  citta?: string;
  cap?: string;
  provincia?: string;
  paese?: string;
  telefono?: string;
  email?: string;
  pec?: string;
  dpoNome?: string;
  dpoEmail?: string;
  dpoIndirizzo?: string;
  privacyPolicy?: string;
  privacyEnabled?: boolean;
  privacyUrl?: string;
  cookiesPolicy?: string;
  cookiesEnabled?: boolean;
  cookiesUrl?: string;
  cookieTecnici?: boolean;
  cookieAnalitici?: boolean;
  cookieMarketing?: boolean;
  showCookieBanner?: boolean;
  cookieBannerText?: string;
  cookieAcceptText?: string;
  cookieDeclineText?: string;
  terminiServizio?: string;
  terminiUrl?: string;
  thirdPartyScriptsEnabled?: boolean;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  amazonTagId?: string;
  adSenseId?: string;
  adSenseSlotHorizontal?: string;
  adSenseSlotRectangle?: string;
  adSenseSlotTop?: string;
  adSenseSlotInline?: string;
}

export default function CompanyDataPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<CompanyData>({
    id: '',
    privacyEnabled: true,
    cookiesEnabled: true,
    cookieTecnici: true,
    cookieAnalitici: true,
    cookieMarketing: true,
    showCookieBanner: true,
    thirdPartyScriptsEnabled: true,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('/api/company-data');
        if (!response.ok) throw new Error('Errore nel fetch');
        const companyData = await response.json();
        if (isMounted) {
          setData(companyData);
        }
      } catch (error) {
        console.error('Errore:', error);
        if (isMounted) {
          toast({
            title: 'Errore',
            description: 'Impossibile caricare i dati azienda',
            variant: 'destructive',
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/company-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Errore nel salvataggio');

      toast({
        title: 'Successo',
        description: 'Dati salvati correttamente',
      });
    } catch (error) {
      console.error('Errore:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile salvare i dati',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof CompanyData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dati Azienda</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Salvataggio...' : 'Salva Modifiche'}
        </Button>
      </div>

      <Tabs defaultValue="aziendali" className="space-y-4">
        <TabsList>
          <TabsTrigger value="aziendali">Dati Aziendali</TabsTrigger>
          <TabsTrigger value="privacy">Privacy & Cookie</TabsTrigger>
          <TabsTrigger value="script">Script</TabsTrigger>
        </TabsList>

        <TabsContent value="aziendali">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Aziendali</CardTitle>
              <CardDescription>Gestisci i dati anagrafici dell'azienda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ragioneSociale">Ragione Sociale</Label>
                  <Input
                    id="ragioneSociale"
                    value={data.ragioneSociale || ''}
                    onChange={e => handleChange('ragioneSociale', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="partitaIva">Partita IVA</Label>
                  <Input
                    id="partitaIva"
                    value={data.partitaIva || ''}
                    onChange={e => handleChange('partitaIva', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="codiceFiscale">Codice Fiscale</Label>
                  <Input
                    id="codiceFiscale"
                    value={data.codiceFiscale || ''}
                    onChange={e => handleChange('codiceFiscale', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email || ''}
                    onChange={e => handleChange('email', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="pec">PEC</Label>
                  <Input
                    id="pec"
                    type="email"
                    value={data.pec || ''}
                    onChange={e => handleChange('pec', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Telefono</Label>
                  <Input
                    id="telefono"
                    value={data.telefono || ''}
                    onChange={e => handleChange('telefono', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="indirizzo">Indirizzo</Label>
                  <Input
                    id="indirizzo"
                    value={data.indirizzo || ''}
                    onChange={e => handleChange('indirizzo', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="citta">Città</Label>
                  <Input
                    id="citta"
                    value={data.citta || ''}
                    onChange={e => handleChange('citta', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cap">CAP</Label>
                  <Input
                    id="cap"
                    value={data.cap || ''}
                    onChange={e => handleChange('cap', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="provincia">Provincia</Label>
                  <Input
                    id="provincia"
                    value={data.provincia || ''}
                    onChange={e => handleChange('provincia', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="paese">Paese</Label>
                  <Input
                    id="paese"
                    value={data.paese || ''}
                    onChange={e => handleChange('paese', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Data Protection Officer (DPO)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dpoNome">Nome DPO</Label>
                    <Input
                      id="dpoNome"
                      value={data.dpoNome || ''}
                      onChange={e => handleChange('dpoNome', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="dpoEmail">Email DPO</Label>
                    <Input
                      id="dpoEmail"
                      type="email"
                      value={data.dpoEmail || ''}
                      onChange={e => handleChange('dpoEmail', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dpoIndirizzo">Indirizzo DPO</Label>
                    <Input
                      id="dpoIndirizzo"
                      value={data.dpoIndirizzo || ''}
                      onChange={e => handleChange('dpoIndirizzo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Policy</CardTitle>
              <CardDescription>Gestisci la privacy policy e i relativi cookie</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="privacyEnabled"
                  checked={data.privacyEnabled}
                  onCheckedChange={checked => handleChange('privacyEnabled', checked)}
                />
                <Label htmlFor="privacyEnabled">Abilita Privacy Policy</Label>
              </div>

              <div>
                <Label htmlFor="privacyUrl">URL Privacy Policy</Label>
                <Input
                  id="privacyUrl"
                  value={data.privacyUrl || ''}
                  onChange={e => handleChange('privacyUrl', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="privacyPolicy">Testo Privacy Policy</Label>
                <Textarea
                  id="privacyPolicy"
                  value={data.privacyPolicy || ''}
                  onChange={e => handleChange('privacyPolicy', e.target.value)}
                  rows={10}
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Cookie Policy</h3>

                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id="showCookieBanner"
                    checked={data.showCookieBanner}
                    onCheckedChange={checked => handleChange('showCookieBanner', checked)}
                  />
                  <Label htmlFor="showCookieBanner">Mostra Banner Cookie</Label>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id="cookiesEnabled"
                    checked={data.cookiesEnabled}
                    onCheckedChange={checked => handleChange('cookiesEnabled', checked)}
                  />
                  <Label htmlFor="cookiesEnabled">Abilita Cookie Policy</Label>
                </div>

                <div>
                  <Label htmlFor="cookiesUrl">URL Cookie Policy</Label>
                  <Input
                    id="cookiesUrl"
                    value={data.cookiesUrl || ''}
                    onChange={e => handleChange('cookiesUrl', e.target.value)}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Tipi di Cookie</h4>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cookieTecnici"
                      checked={data.cookieTecnici}
                      onCheckedChange={checked => handleChange('cookieTecnici', checked)}
                    />
                    <Label htmlFor="cookieTecnici">Cookie Tecnici</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cookieAnalitici"
                      checked={data.cookieAnalitici}
                      onCheckedChange={checked => handleChange('cookieAnalitici', checked)}
                    />
                    <Label htmlFor="cookieAnalitici">Cookie Analitici</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cookieMarketing"
                      checked={data.cookieMarketing}
                      onCheckedChange={checked => handleChange('cookieMarketing', checked)}
                    />
                    <Label htmlFor="cookieMarketing">Cookie Marketing</Label>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="cookieBannerText">Testo Banner Cookie</Label>
                  <Textarea
                    id="cookieBannerText"
                    value={data.cookieBannerText || ''}
                    onChange={e => handleChange('cookieBannerText', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="cookieAcceptText">Testo Pulsante Accetta</Label>
                  <Input
                    id="cookieAcceptText"
                    value={data.cookieAcceptText || ''}
                    onChange={e => handleChange('cookieAcceptText', e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <Label htmlFor="cookieDeclineText">Testo Pulsante Rifiuta</Label>
                  <Input
                    id="cookieDeclineText"
                    value={data.cookieDeclineText || ''}
                    onChange={e => handleChange('cookieDeclineText', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Termini di Servizio</h3>
                <div>
                  <Label htmlFor="terminiUrl">URL Termini di Servizio</Label>
                  <Input
                    id="terminiUrl"
                    value={data.terminiUrl || ''}
                    onChange={e => handleChange('terminiUrl', e.target.value)}
                  />
                </div>
                <div className="mt-4">
                  <Label htmlFor="terminiServizio">Testo Termini di Servizio</Label>
                  <Textarea
                    id="terminiServizio"
                    value={data.terminiServizio || ''}
                    onChange={e => handleChange('terminiServizio', e.target.value)}
                    rows={10}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="script">
          <Card>
            <CardHeader>
              <CardTitle>Script di Terze Parti</CardTitle>
              <CardDescription>Gestisci gli script di tracciamento e pubblicità</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="thirdPartyScriptsEnabled"
                  checked={data.thirdPartyScriptsEnabled}
                  onCheckedChange={checked => handleChange('thirdPartyScriptsEnabled', checked)}
                />
                <Label htmlFor="thirdPartyScriptsEnabled">Abilita Script di Terze Parti</Label>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Google Analytics</h3>
                <div>
                  <Label htmlFor="googleAnalyticsId">ID Google Analytics (G-XXXXXXXXXX)</Label>
                  <Input
                    id="googleAnalyticsId"
                    placeholder="G-XXXXXXXXXX"
                    value={data.googleAnalyticsId || ''}
                    onChange={e => handleChange('googleAnalyticsId', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Facebook Pixel</h3>
                <div>
                  <Label htmlFor="facebookPixelId">ID Facebook Pixel</Label>
                  <Input
                    id="facebookPixelId"
                    placeholder="XXXXXXXXXXXXXXX"
                    value={data.facebookPixelId || ''}
                    onChange={e => handleChange('facebookPixelId', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Amazon Tag</h3>
                <div>
                  <Label htmlFor="amazonTagId">ID Amazon Tag</Label>
                  <Input
                    id="amazonTagId"
                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                    value={data.amazonTagId || ''}
                    onChange={e => handleChange('amazonTagId', e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-lg font-semibold mb-4">Google AdSense</h3>

                <div className="mb-4">
                  <Label htmlFor="adSenseId">ID Publisher AdSense (ca-pub-XXXXXXXXXXXXXXXX)</Label>
                  <Input
                    id="adSenseId"
                    placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                    value={data.adSenseId || ''}
                    onChange={e => handleChange('adSenseId', e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Inserisci il tuo ID Publisher di Google AdSense
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Ad Slot IDs</h4>
                  <p className="text-sm text-muted-foreground">
                    Inserisci gli ID Slot creati nel tuo account AdSense per ciascun tipo di banner
                  </p>

                  <div>
                    <Label htmlFor="adSenseSlotHorizontal">Slot Banner Orizzontale</Label>
                    <Input
                      id="adSenseSlotHorizontal"
                      placeholder="XXXXXXXXXX"
                      value={data.adSenseSlotHorizontal || ''}
                      onChange={e => handleChange('adSenseSlotHorizontal', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adSenseSlotRectangle">Slot Banner Rettangolare</Label>
                    <Input
                      id="adSenseSlotRectangle"
                      placeholder="XXXXXXXXXX"
                      value={data.adSenseSlotRectangle || ''}
                      onChange={e => handleChange('adSenseSlotRectangle', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adSenseSlotTop">Slot Banner Top</Label>
                    <Input
                      id="adSenseSlotTop"
                      placeholder="XXXXXXXXXX"
                      value={data.adSenseSlotTop || ''}
                      onChange={e => handleChange('adSenseSlotTop', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="adSenseSlotInline">Slot Banner Inline</Label>
                    <Input
                      id="adSenseSlotInline"
                      placeholder="XXXXXXXXXX"
                      value={data.adSenseSlotInline || ''}
                      onChange={e => handleChange('adSenseSlotInline', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}