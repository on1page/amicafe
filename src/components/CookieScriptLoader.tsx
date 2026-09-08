'use client';

import { useState, useEffect } from 'react';
import { ScriptHTMLAttributes } from 'react';

interface CookieScriptLoaderProps {
  cookieType: 'tecnici' | 'analitici' | 'marketing';
  src?: string;
  id: string;
  options?: ScriptHTMLAttributes<HTMLScriptElement>;
  onConsentChange?: (allowed: boolean) => void;
  debug?: boolean;
}

export default function CookieScriptLoader({
  cookieType,
  src,
  id,
  options = {},
  onConsentChange,
  debug = false
}: CookieScriptLoaderProps) {
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const checkConsent = () => {
      const cookieConsent = localStorage.getItem('cookie-preferences');
      const consent = cookieConsent ? JSON.parse(cookieConsent) : null;

      let allowed = false;
      if (cookieType === 'tecnici') {
        allowed = consent?.technical !== false;
      } else if (cookieType === 'analitici') {
        allowed = consent?.analytics === true;
      } else if (cookieType === 'marketing') {
        allowed = consent?.marketing === true;
      }

      setConsentGiven(allowed);
    };

    checkConsent();

    // Ascolta cambiamenti nel consenso
    const handleConsentChange = () => {
      checkConsent();
    };

    window.addEventListener('cookie-consent-changed', handleConsentChange);
    return () => window.removeEventListener('cookie-consent-changed', handleConsentChange);
  }, [cookieType]);

  useEffect(() => {
    if (consentGiven && src && !document.getElementById(id)) {
      const script = document.createElement('script');
      script.id = id;
      script.src = src;
      script.async = options.async ?? true;
      script.crossOrigin = options.crossOrigin ?? null;

      script.onload = () => {
        if (debug) console.log(`[CookieScriptLoader] Script caricato: ${id}`);
        onConsentChange?.(true);
      };

      script.onerror = () => {
        if (debug) console.error(`[CookieScriptLoader] Errore caricamento: ${id}`);
        onConsentChange?.(false);
      };

      document.head.appendChild(script);
    } else if (consentGiven && !src) {
      // Per script senza src (inline)
      if (debug) console.log(`[CookieScriptLoader] Script inline richiesto: ${id}`);
      onConsentChange?.(true);
    }
  }, [consentGiven, src, id, options, onConsentChange, debug]);

  return null;
}

export function executeInitScript(scriptContent: string, id: string) {
  if (!document.getElementById(id)) {
    const script = document.createElement('script');
    script.id = id;
    script.textContent = scriptContent;
    document.head.appendChild(script);
  }
}