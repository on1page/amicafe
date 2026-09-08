'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Calendar, Clock, Euro, Users, Sparkles, Loader2, MapPin, Share2, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ReservationDialog from '@/components/ReservationDialog'
import AdBanner from '@/components/AdBanner'
import AdSenseBanner from '@/components/AdSenseBanner'
import AdSenseHorizontal from '@/components/AdSenseHorizontal'
import AdSenseRectangle from '@/components/AdSenseRectangle'

interface Evento {
  id: string
  titolo: string
  slug: string
  descrizione: string
  descrizioneBreve: string
  immagineUrl: string | null
  data: string
  oraInizio: string
  oraFine: string
  prezzo: number
  etichettaPrezzo: string | null
  gratuito: boolean
  graditaPrenotazione: boolean
  capacita: number
  postiDisponibili: number
  postiRimanenti: number | null
  location: string | null
  incluso: string[] | null
  infoAggiuntive: string[] | null
  inEvidenza: boolean
  nuovo: boolean
}

export default function EventiPage() {
  const [eventi, setEventi] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Evento | null>(null)
  const [reservationOpen, setReservationOpen] = useState(false)
  const [eventForReservation, setEventForReservation] = useState<Evento | null>(null)

  useEffect(() => {
    let isMounted = true;

    const fetchEventi = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/eventi');
        const result = await response.json();
        if (isMounted) {
          setEventi(result.data || []);
        }
      } catch (error) {
        console.error('Errore nel recupero eventi:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEventi();

    return () => {
      isMounted = false;
    };
  }, []);

  // Funzione per ricaricare gli eventi e aggiornare l'evento selezionato
  const refreshEventi = useCallback(async () => {
    try {
      const response = await fetch('/api/eventi');
      const result = await response.json();
      const nuoviEventi = result.data || [];
      setEventi(nuoviEventi);

      // Aggiorna l'evento selezionato con i dati aggiornati
      if (selectedEvent) {
        const eventoAggiornato = nuoviEventi.find((e: Evento) => e.id === selectedEvent.id);
        if (eventoAggiornato) {
          setSelectedEvent(eventoAggiornato);
        }
      }
    } catch (error) {
      console.error('Errore nel ricaricamento eventi:', error);
    }
  }, [selectedEvent]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short'
    });
  }

  function handlePrenota() {
    if (!selectedEvent) return;
    // Salva l'evento per la prenotazione mantenendo selectedEvent
    setEventForReservation(selectedEvent);
    setReservationOpen(true);
  }

  const handleShare = useCallback(async () => {
    if (!selectedEvent) return;
    const text = `🎫 ${selectedEvent.titolo}\n📅 ${formatDate(selectedEvent.data)} ore ${selectedEvent.oraInizio}\n${selectedEvent.gratuito ? '🆓 Gratuito' : `💰 €${selectedEvent.prezzo}`}\n${selectedEvent.descrizioneBreve}`;
    const url = window.location.href;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: selectedEvent.titolo, text, url });
        return;
      } catch {
        // Utente ha annullato o errore, fallback WhatsApp
      }
    }
    // Fallback: WhatsApp
    const encoded = encodeURIComponent(`${text}\n\n${url}`);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }, [selectedEvent, formatDate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header semplificato */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Torna alla Home</span>
          </Link>
        </div>
      </header>

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eventi e News</h1>
          <p className="text-lg text-gray-600">
            Scopri le nostre serate speciali ed eventi esclusivi
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner AdSense TOP - Orizzontale */}
        <AdSenseHorizontal />

        {/* Banner Database TOP - Sponsorizzati */}
        <AdBanner pagina="eventi" posizione="top" tipo="horizontal" />

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            {/* Nessun evento */}
            {eventi.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nessun evento trovato</h3>
                <p className="text-gray-500">Al momento non ci sono eventi in programma. Torna presto!</p>
              </div>
            ) : (
              <>
                {/* Griglia Eventi */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {eventi.map((evento, index) => (
                    <Card
                      key={evento.id}
                      className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-orange-200 overflow-hidden flex flex-col h-full cursor-pointer ${
                        evento.inEvidenza ? 'ring-2 ring-orange-300' : ''
                      }`}
                      onClick={() => setSelectedEvent(evento)}
                    >
                      {/* Immagine */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {evento.immagineUrl ? (
                          <img src={evento.immagineUrl} alt={evento.titolo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-orange-400" />
                          </div>
                        )}

                        {/* Badges in alto a destra */}
                        <div className="absolute top-4 right-4 flex gap-2">
                          {evento.nuovo && (
                            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full shadow-md">
                              🔥 Nuovo
                            </span>
                          )}
                          {evento.inEvidenza && (
                            <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              In evidenza
                            </span>
                          )}
                        </div>

                        {/* Badge in basso a sinistra */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          {evento.gratuito && (
                            <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow-md">
                              Gratuito
                            </span>
                          )}
                          {evento.graditaPrenotazione && !evento.gratuito && (
                            <span className="px-3 py-1.5 bg-blue-500 text-white text-xs font-semibold rounded-full shadow-md">
                              Prenotazione consigliata
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contenuto */}
                      <div className="p-5 flex flex-col flex-grow">
                        {/* Data e Ora */}
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-600">{formatShortDate(evento.data)}</span>
                          <span className="text-gray-400">•</span>
                          <Clock className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-600">{evento.oraInizio}</span>
                        </div>

                        {/* Titolo */}
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {evento.titolo}
                        </h3>

                        {/* Descrizione breve */}
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{evento.descrizioneBreve}</p>

                        {/* Footer Card */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                          {/* Posti rimanenti */}
                          {evento.graditaPrenotazione && evento.capacita > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-blue-500" />
                              <span className={
                                (evento.postiRimanenti ?? evento.capacita) <= 5 ? 'text-red-600 font-semibold' :
                                (evento.postiRimanenti ?? evento.capacita) <= 10 ? 'text-yellow-600 font-semibold' :
                                'text-green-600 font-semibold'
                              }>
                                {evento.postiRimanenti ?? evento.capacita} disponibili
                              </span>
                              <span className="text-gray-400">/ {evento.capacita} totali</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            {evento.gratuito ? (
                              <span className="text-xl font-bold text-green-600">Gratuito</span>
                            ) : (
                              <div className="flex flex-col">
                                {evento.etichettaPrezzo && (
                                  <span className="text-xs text-gray-500">{evento.etichettaPrezzo}</span>
                                )}
                                <span className="text-xl font-bold text-orange-600">€{evento.prezzo}</span>
                              </div>
                            )}

                            <span className="text-sm font-medium text-orange-600 group-hover:gap-2 transition-all flex items-center gap-1">
                              Dettagli
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Banner AdSense INLINE - Mostra dopo il 3° evento se ci sono almeno 4 */}
                {eventi.length >= 4 && (
                  <div className="mt-8">
                    <AdSenseRectangle />
                  </div>
                )}

                {/* Banner Database INLINE */}
                <AdBanner pagina="eventi" posizione="inline" tipo="horizontal" />
              </>
            )}

            {/* Banner Database BOTTOM */}
            <AdBanner pagina="eventi" posizione="bottom" tipo="horizontal" />
          </>
        )}
      </div>

      {/* Dialog Dettagli Evento */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0">
          {selectedEvent && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedEvent.titolo}</DialogTitle>
              </DialogHeader>

              {/* Immagine compatta */}
              <div className="relative h-40 sm:h-48 shrink-0">
                {selectedEvent.immagineUrl ? (
                  <img src={selectedEvent.immagineUrl} alt={selectedEvent.titolo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                    <Calendar className="w-14 h-14 text-orange-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Badges immagine */}
                <div className="absolute bottom-3 left-4 flex gap-2">
                  {selectedEvent.gratuito && (
                    <span className="px-3 py-1.5 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">Gratuito</span>
                  )}
                  {selectedEvent.graditaPrenotazione && (
                    <span className="px-3 py-1.5 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-lg">Prenotazione consigliata</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{selectedEvent.titolo}</h2>

                {/* Meta Info Grid */}
                <div className={`grid gap-4 mb-6 ${selectedEvent.graditaPrenotazione ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {/* Data */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Data</p>
                      <p className="font-semibold text-gray-900">{formatDate(selectedEvent.data)}</p>
                      <p className="text-sm text-gray-600">{selectedEvent.oraInizio} - {selectedEvent.oraFine}</p>
                    </div>
                  </div>

                  {/* Prezzo */}
                  {!selectedEvent.gratuito && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Euro className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Prezzo</p>
                        <p className="font-semibold text-gray-900">€{selectedEvent.prezzo}</p>
                        {selectedEvent.etichettaPrezzo && (
                          <p className="text-sm text-gray-600">{selectedEvent.etichettaPrezzo}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Posti - solo se gradita prenotazione */}
                  {selectedEvent.graditaPrenotazione && selectedEvent.capacita > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Posti</p>
                        <p className={`font-semibold ${
                          (selectedEvent.postiRimanenti ?? selectedEvent.capacita) <= 5 ? 'text-red-600' :
                          (selectedEvent.postiRimanenti ?? selectedEvent.capacita) <= 10 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {selectedEvent.postiRimanenti ?? selectedEvent.capacita} disponibili
                        </p>
                        <p className="text-sm text-gray-600">su {selectedEvent.capacita} totali</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Location */}
                {selectedEvent.location && (
                  <div className="mb-6 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{selectedEvent.location}</span>
                  </div>
                )}

                {/* Descrizione */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Descrizione</h3>
                  <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed">
                    {selectedEvent.descrizione.split('\n').map((para, idx) => (
                      <p key={idx} className="mb-3">{para}</p>
                    ))}
                  </div>
                </div>

                {/* Incluso */}
                {Array.isArray(selectedEvent.incluso) && selectedEvent.incluso.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <span>✓</span> {selectedEvent.gratuito ? 'Cosa include' : 'Incluso nel prezzo'}
                    </h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      {selectedEvent.incluso.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Info Aggiuntive */}
                {Array.isArray(selectedEvent.infoAggiuntive) && selectedEvent.infoAggiuntive.length > 0 && (
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-semibold text-gray-800 mb-2">Info aggiuntive</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedEvent.infoAggiuntive.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer con CTA */}
              <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 shrink-0">
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedEvent.graditaPrenotazione ? (
                    <Button className="flex-1" size="lg" onClick={handlePrenota}>
                      {selectedEvent.gratuito ? 'Prenota un posto' : `Prenota ora - €${selectedEvent.prezzo}`}
                    </Button>
                  ) : selectedEvent.gratuito ? (
                    <Button className="flex-1" size="lg" variant="outline" onClick={handlePrenota}>
                      Partecipa all&apos;evento
                    </Button>
                  ) : (
                    <Button className="flex-1" size="lg" onClick={handlePrenota}>
                      Scopri di più - €${selectedEvent.prezzo}
                    </Button>
                  )}
                  <Button variant="outline" size="lg" onClick={handleShare} className="gap-2">
                    <Share2 className="w-4 h-4" />
                    Condividi
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reservation Dialog */}
      {reservationOpen && eventForReservation && (
        <ReservationDialog
          onClose={() => {
            setReservationOpen(false);
            setEventForReservation(null);
          }}
          eventoId={eventForReservation.id}
          eventoData={eventForReservation.data.split('T')[0]}
          eventoOra={eventForReservation.oraInizio}
          eventoTitolo={eventForReservation.titolo}
          onSuccess={refreshEventi}
        />
      )}
    </div>
  );
}