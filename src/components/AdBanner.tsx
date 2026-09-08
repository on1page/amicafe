'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, X } from 'lucide-react';

interface Banner {
  id: string;
  tipo: string;
  posizione: string;
  sponsorNome: string;
  sponsorLogo?: string | null;
  sponsorUrl: string;
  titolo?: string | null;
  descrizione?: string | null;
  ctaTesto?: string | null;
  ctaUrl?: string | null;
  immagineUrl?: string | null;
  coloreSfondo?: string | null;
  attivo: boolean;
  ordine: number;
  pagine?: string | null;
}

interface AdBannerProps {
  pagina?: string;
  posizione?: 'top' | 'bottom' | 'left' | 'right' | 'inline';
  tipo?: 'horizontal' | 'vertical';
}

// Funzione helper - definita fuori dal componente
function checkMarketingConsent(consent: string | null, preferences: string | null): boolean {
  if (!consent) return false;

  if (consent === 'accepted') return true;

  if (consent === 'custom' && preferences) {
    try {
      const prefs = JSON.parse(preferences);
      return prefs.marketing === true;
    } catch {
      return false;
    }
  }

  return false;
}

export default function AdBanner({ pagina = 'eventi', posizione = 'top', tipo }: AdBannerProps) {
  // Inizializza dismissedBanners leggendo direttamente da localStorage
  const getInitialDismissed = (): Set<string> => {
    if (typeof window === 'undefined') return new Set();
    try {
      const dismissed = localStorage.getItem('dismissed-banners');
      return dismissed ? new Set(JSON.parse(dismissed)) : new Set();
    } catch {
      return new Set();
    }
  };

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [canShow, setCanShow] = useState(false);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(getInitialDismissed());
  
  const isMountedRef = useRef(true);

  // Helper per setState sicuro
  const safeSetState = <T,>(setter: (value: T) => void, value: T) => {
    if (isMountedRef.current) {
      setter(value);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Effect per controllare se può mostrare i banner
  useEffect(() => {
    const checkCanShow = async () => {
      try {
        const cookieConsent = localStorage.getItem('cookie-consent');
        const cookiePreferences = localStorage.getItem('cookie-preferences');
        const hasMarketingConsent = checkMarketingConsent(cookieConsent, cookiePreferences);

        const response = await fetch('/api/company-data');
        if (!response.ok) {
          safeSetState(setCanShow, hasMarketingConsent);
          return;
        }

        const result = await response.json();
        const companyData = result;
        const scriptsEnabled = companyData.thirdPartyScriptsEnabled ?? false;

        safeSetState(setCanShow, hasMarketingConsent || scriptsEnabled);
      } catch (error) {
        console.error('[AdBanner] Errore nel controllo permessi banner:', error);
        const cookieConsent = localStorage.getItem('cookie-consent');
        const cookiePreferences = localStorage.getItem('cookie-preferences');
        const hasMarketingConsent = checkMarketingConsent(cookieConsent, cookiePreferences);
        safeSetState(setCanShow, hasMarketingConsent);
      }
    };

    checkCanShow();
  }, []);

  // Effect per fetch banners
  useEffect(() => {
    if (!canShow) {
      safeSetState(setLoading, false);
      return;
    }

    const fetchBanners = async () => {
      try {
        const params = new URLSearchParams({ pagina });
        if (tipo) params.append('tipo', tipo);
        if (posizione) params.append('posizione', posizione);

        const response = await fetch(`/api/banners?${params.toString()}`);
        if (response.ok && isMountedRef.current) {
          const result = await response.json();
          safeSetState(setBanners, result.data || []);
        }
      } catch (error) {
        console.error('Errore nel recupero banner:', error);
      } finally {
        if (isMountedRef.current) {
          safeSetState(setLoading, false);
        }
      }
    };

    fetchBanners();
  }, [canShow, pagina, tipo, posizione]);

  const handleDismiss = (bannerId: string) => {
    const newDismissed = new Set(dismissedBanners);
    newDismissed.add(bannerId);
    setDismissedBanners(newDismissed);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('dismissed-banners', JSON.stringify([...newDismissed]));
    }

    setBanners(prev => prev.filter(b => b.id !== bannerId));
  };

  if (loading || !canShow || banners.length === 0) {
    return null;
  }

  const visibleBanners = banners.filter(b => !dismissedBanners.has(b.id));

  if (visibleBanners.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      {visibleBanners.map((banner) => (
        <AdBannerItem
          key={banner.id}
          banner={banner}
          onDismiss={() => handleDismiss(banner.id)}
        />
      ))}
    </div>
  );
}

interface AdBannerItemProps {
  banner: Banner;
  onDismiss: () => void;
}

function AdBannerItem({ banner, onDismiss }: AdBannerItemProps) {
  const isHorizontal = banner.tipo === 'horizontal';

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow ${
        isHorizontal ? 'my-6' : 'my-4'
      }`}
      style={{ backgroundColor: banner.coloreSfondo || '#f9fafb' }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-2 right-2 z-10 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-colors"
        aria-label="Chiudi banner"
      >
        <X className="w-4 h-4 text-gray-600" />
      </button>

      <div className={`${isHorizontal ? 'flex md:flex-row' : 'flex flex-col'} items-stretch`}>
        {banner.immagineUrl || banner.sponsorLogo ? (
          <div className={`relative ${
            isHorizontal ? 'w-1/3 md:w-1/4 min-h-[150px] md:min-h-[200px]' : 'w-full h-40'
          }`}>
            <a
              href={banner.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                src={banner.immagineUrl || banner.sponsorLogo!}
                alt={banner.titolo || banner.sponsorNome}
                className="w-full h-full object-cover"
              />
            </a>
          </div>
        ) : null}

        <div className={`flex-1 p-4 md:p-6 flex flex-col justify-between ${
          banner.immagineUrl || banner.sponsorLogo ? '' : 'p-4 md:p-6'
        }`}>
          <div>
            {banner.sponsorLogo && !banner.immagineUrl ? (
              <a
                href={banner.sponsorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors mb-2"
              >
                <span className="text-xs text-gray-400">Sponsorizzato da</span>
                <img
                  src={banner.sponsorLogo}
                  alt={banner.sponsorNome}
                  className="h-6 w-auto"
                />
              </a>
            ) : (
              <span className="text-xs text-gray-400 block mb-2">
                Sponsorizzato da {banner.sponsorNome}
              </span>
            )}

            {banner.titolo && (
              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                {banner.titolo}
              </h3>
            )}

            {banner.descrizione && (
              <p className="text-sm md:text-base text-gray-700 mb-4 line-clamp-2">
                {banner.descrizione}
              </p>
            )}
          </div>

          {(banner.ctaTesto && banner.ctaUrl) ? (
            <a
              href={banner.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base"
            >
              {banner.ctaTesto}
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <a
              href={banner.sponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm md:text-base"
            >
              Visita {banner.sponsorNome}
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}