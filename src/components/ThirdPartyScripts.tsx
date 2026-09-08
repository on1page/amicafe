'use client';

import { useState, useEffect } from 'react';
import CookieScriptLoader, { executeInitScript } from './CookieScriptLoader';

interface CompanyData {
  thirdPartyScriptsEnabled?: boolean;
  googleAnalyticsId?: string | null;
  facebookPixelId?: string | null;
  amazonTagId?: string | null;
  adSenseId?: string | null;
}

export default function ThirdPartyScripts() {
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [mounted] = useState(() => typeof window !== 'undefined');

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/admin/company-data');
      if (response.ok) {
        const result = await response.json();
        // Supporta entrambi i formati: { data: {...} } o direttamente i dati
        const data = result.data || result;
        setTimeout(() => setCompanyData(data), 0);
      }
    } catch (error) {
      console.error('Errore nel recupero company data per script:', error);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, []);

  // Non renderizzare nulla se non montato (per evitare hydration mismatch)
  if (!mounted || !companyData) {
    return null;
  }

  // Se gli script di terze parti sono disabilitati, non caricare nulla
  if (companyData.thirdPartyScriptsEnabled === false) {
    return null;
  }

  return (
    <>
      {/* Google Analytics 4 (GA4) - Cookie Analitici */}
      {companyData.googleAnalyticsId && (
        <CookieScriptLoader
          cookieType="analitici"
          src={`https://www.googletagmanager.com/gtag/js?id=${companyData.googleAnalyticsId}`}
          id="google-analytics-gtag"
          options={{
            async: true,
            crossOrigin: 'anonymous',
          }}
          onConsentChange={() => {
            // Quando il consenso viene dato, inizializza GA4
            if (typeof window !== 'undefined' && (window as any).gtag) {
              const gtag = (window as any).gtag;
              gtag('js', new Date());
              gtag('config', companyData.googleAnalyticsId);
            }
          }}
          debug={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Facebook Pixel / Meta Pixel - Cookie Marketing */}
      {companyData.facebookPixelId && (
        <CookieScriptLoader
          cookieType="marketing"
          id="facebook-pixel-fbq"
          onConsentChange={(allowed) => {
            if (allowed && companyData.facebookPixelId) {
              // Inizializza Facebook Pixel quando il consenso viene dato
              const fbqScript = `
                (function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${companyData.facebookPixelId}');
                fbq('track', 'PageView');
              `;
              executeInitScript(fbqScript, 'facebook-pixel-init');
            }
          }}
          debug={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Amazon Pixel / Associate Tag - Cookie Marketing */}
      {companyData.amazonTagId && (
        <CookieScriptLoader
          cookieType="marketing"
          id="amazon-pixel-tag"
          onConsentChange={(allowed) => {
            if (allowed && companyData.amazonTagId) {
              // Inizializza Amazon Pixel quando il consenso viene dato
              const amazonScript = `
                window.amznpix = window.amznpix || [];
                window.amznpix.push(['init', '${companyData.amazonTagId}']);
                (function(d, t) {
                  var a = d.createElement(t);
                  a.async = !0;
                  a.src = 'https://static-na.payments-amazon.com/OffAmazonPayments/us/sandbox/js/Widgets.js';
                  d.getElementsByTagName('head')[0].appendChild(a);
                })(document, 'script');
              `;
              executeInitScript(amazonScript, 'amazon-pixel-init');
            }
          }}
          debug={process.env.NODE_ENV === 'development'}
        />
      )}

      {/* Google AdSense - Cookie Marketing */}
      {companyData.adSenseId && (
        <CookieScriptLoader
          cookieType="marketing"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${companyData.adSenseId}`}
          id="google-adsense-script"
          options={{
            async: true,
            crossOrigin: 'anonymous',
          }}
          onConsentChange={(allowed) => {
            if (allowed && process.env.NODE_ENV === 'development') {
              console.log('[ThirdPartyScripts] AdSense script caricato con ID:', companyData.adSenseId);
            }
          }}
          debug={process.env.NODE_ENV === 'development'}
        />
      )}
    </>
  );
}