'use client';

import { useEffect, useState } from 'react';

interface AdSenseBannerProps {
  adSenseId?: string;
  adSlotId?: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdSenseBanner({
  adSenseId: propAdSenseId,
  adSlotId: propAdSlotId,
  adFormat = 'auto',
  className = '',
}: AdSenseBannerProps) {
  const [adSenseId, setAdSenseId] = useState<string | null>(null);
  const [adSlotId, setAdSlotId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [adInitialized, setAdInitialized] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const adElementId = `adsense-${Math.random().toString(36).substr(2, 9)}`;

  // Verifica consenso cookie marketing
  useEffect(() => {
    const checkConsent = () => {
      const consent = localStorage.getItem('cookieConsent');
      if (consent === 'all' || consent === 'marketing') {
        setHasConsent(true);
      } else {
        setHasConsent(false);
      }
    };

    checkConsent();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cookieConsent') {
        checkConsent();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Fetch AdSense ID e Slot ID dal database
  useEffect(() => {
    const fetchAdSenseData = async () => {
      try {
        const response = await fetch('/api/company-data');
        if (!response.ok) return;

        const data = await response.json();
        if (data.adSenseId) {
          setAdSenseId(data.adSenseId);
        }
        if (propAdSlotId) {
          setAdSlotId(propAdSlotId);
        }
      } catch (error) {
        console.error('Errore nel fetch dei dati AdSense:', error);
      }
    };

    fetchAdSenseData();
  }, [propAdSlotId]);

  // Carica script AdSense
  useEffect(() => {
    if (!adSenseId || !hasConsent || scriptLoaded) return;

    const script = document.createElement('script');
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`;
    script.async = true;
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      setScriptLoaded(true);
      console.log('[AdSense] Script caricato con successo:', adSenseId);
    };

    script.onerror = () => {
      console.error('[AdSense] Errore nel caricamento dello script');
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [adSenseId, hasConsent, scriptLoaded]);

  // Inizializza annuncio
  useEffect(() => {
    if (!scriptLoaded || adInitialized || !adSenseId || !adSlotId) return;

    const initializeAd = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({
              google_ad_client: adSenseId,
              enable_page_level_ads: false,
            });
            setAdInitialized(true);
            console.log('[AdSense] Annuncio inizializzato con successo:', adSlotId);
          } catch (error) {
            console.error('[AdSense] Errore nell\'inizializzazione:', error);
          }
        });
      });
    };

    initializeAd();
  }, [scriptLoaded, adInitialized, adElementId, adSenseId, adSlotId]);

  if (!hasConsent || !adSenseId || !adSlotId) {
    return null;
  }

  const formatStyle = {
    auto: {},
    rectangle: { width: '300px', height: '250px' },
    horizontal: { width: '728px', height: '90px' },
    vertical: { width: '160px', height: '600px' },
  };

  const adStyle = adFormat !== 'auto' ? formatStyle[adFormat] : {};

  return (
    <div className={`w-full flex justify-center my-4 ${className}`}>
      <div style={{ minWidth: '300px', minHeight: '100px' }}>
        <ins
          id={adElementId}
          className="adsbygoogle block"
          style={{
            display: 'inline-block',
            ...adStyle,
          }}
          data-ad-client={adSenseId}
          data-ad-slot={adSlotId}
          data-ad-format={adFormat === 'auto' ? 'auto' : undefined}
          data-full-width-responsive={adFormat === 'auto' ? 'true' : undefined}
        />
      </div>
    </div>
  );
}