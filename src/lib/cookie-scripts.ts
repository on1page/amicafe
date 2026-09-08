/**
 * Configurazioni predefinite per script di terze parti comuni
 *
 * Queste configurazioni possono essere usate con CookieScriptLoader
 * per caricare script in modo condizionale in base al consenso cookie.
 */

import type { LoadScriptOptions } from './cookie-manager'

// ============================================================================
// GOOGLE ANALYTICS / GOOGLE TAG MANAGER
// ============================================================================

/**
 * Google Analytics 4 (gtag.js)
 *
 * @param measurementId - Il tuo GA4 Measurement ID (es. G-XXXXXXXXXX)
 */
export function createGoogleAnalyticsConfig(measurementId: string): {
  src: string
  options: LoadScriptOptions
  initScript: string
} {
  return {
    src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
    options: {
      id: 'gtag-js',
      async: true
    },
    // Script di inizializzazione da eseguire dopo il caricamento
    initScript: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `
  }
}

// ============================================================================
// FACEBOOK PIXEL
// ============================================================================

/**
 * Facebook Pixel
 *
 * @param pixelId - Il tuo Facebook Pixel ID
 */
export function createFacebookPixelConfig(pixelId: string): {
  src: string
  options: LoadScriptOptions
  initScript: string
} {
  return {
    src: `https://connect.facebook.net/en_US/fbevents.js`,
    options: {
      id: 'facebook-pixel-js'
    },
    initScript: `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${pixelId}');
      fbq('track', 'PageView');
    `
  }
}

// ============================================================================
// HOTJAR
// ============================================================================

/**
 * Hotjar
 *
 * @param siteId - Il tuo Hotjar Site ID
 */
export function createHotjarConfig(siteId: number, hotjarVersion = 6): {
  src: string
  options: LoadScriptOptions
  initScript: string
} {
  return {
    src: `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${hotjarVersion}`,
    options: {
      id: 'hotjar-js',
      async: true
    },
    initScript: `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:${siteId},hjsv:${hotjarVersion}};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','static.hotjar.com/c/');
    `
  }
}

// ============================================================================
// INTERCOM
// ============================================================================

/**
 * Intercom
 *
 * @param appId - Il tuo Intercom App ID
 */
export function createIntercomConfig(appId: string): {
  src: string
  options: LoadScriptOptions
  initScript: string
} {
  return {
    src: 'https://widget.intercom.io/widget/' + appId,
    options: {
      id: 'intercom-js',
      async: true
    },
    initScript: `
      window.intercomSettings = {
        app_id: '${appId}'
      };
      (function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${appId}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();
    `
  }
}

// ============================================================================
// AMAZON ASSOCIATES TAG
// ============================================================================

/**
 * Amazon Associates Tag
 *
 * @param tagId - Il tuo Amazon Associate Tag ID
 */
export function createAmazonConfig(tagId: string): {
  src: string
  options: LoadScriptOptions
  initScript: string
} {
  return {
    src: 'https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US',
    options: {
      id: 'amazon-adsystem',
      async: true
    },
    initScript: `
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (!d.getElementById(id)) {
          js = d.createElement(s);
          js.id = id;
          js.src = 'https://z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=${tagId}';
          fjs.parentNode.insertBefore(js, fjs);
        }
      }(document, 'script', 'amazon-adsystem'));
    `
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Esegue uno script di inizializzazione (inserisce un tag script inline)
 *
 * @param scriptContent - Il contenuto dello script da eseguire
 * @param id - ID opzionale per lo script
 */
export function executeInitScript(scriptContent: string, id?: string): void {
  if (typeof window === 'undefined') return

  // Verifica se lo script è già stato eseguito
  if (id && document.getElementById(id)) {
    console.log(`[executeInitScript] Script ${id} già eseguito`)
    return
  }

  const script = document.createElement('script')
  script.textContent = scriptContent

  if (id) {
    script.id = id
  }

  document.head.appendChild(script)
  console.log('[executeInitScript] Script di inizializzazione eseguito')
}
