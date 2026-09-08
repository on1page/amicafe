# Icone e Favicon

Questo progetto include un set completo di icone e favicon ottimizzati per tutti i dispositivi e browser.

## File delle Icone

### File SVG (Principali)
- **`favicon.svg`** - Favicon principale (formato vettoriale, supportato da browser moderni)
- **`icon.svg`** - Icona PWA a risoluzione completa (512x512)
- **`apple-touch-icon.svg`** - Icona per dispositivi Apple (180x180)
- **`logo.svg`** - Logo del ristorante (esistente)

### File di Configurazione
- **`site.webmanifest`** - Manifest PWA (Progressive Web App)
- **`manifest.json`** - Manifest alternativo per PWA
- **`browserconfig.xml`** - Configurazione per Windows 8/10/11

### Altri File
- **`robots.txt`** - File robots.txt con link al sitemap

## Come Funziona

### Browser Moderni
I browser moderni (Chrome, Firefox, Edge, Safari) supportano le favicon SVG e le caricheranno automaticamente da `/favicon.svg`.

### Dispositivi Apple
I dispositivi iOS usano l'`apple-touch-icon.svg` quando l'utente aggiunge il sito alla home screen.

### Windows
Windows usa il file `browserconfig.xml` per configurare i tile nella start screen.

### PWA (Progressive Web App)
Il file `site.webmanifest` permette al sito di essere installato come app su dispositivi mobili e desktop.

## Come Generare Favicon in Altri Formati

Se vuoi generare favicon in formati aggiuntivi (PNG, ICO), hai diverse opzioni:

### Opzione 1: Online Tools (Più Semplice)

1. Visita [Favicon.io](https://favicon.io/) o [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Carica il file `logo.svg` o `icon.svg`
3. Scarica il pacchetto di favicon generato
4. Copia i file nella cartella `public/`

### Opzione 2: Da Riga di Comando

Se hai ImageMagick installato:

```bash
# Genera favicon.ico da icon.svg
convert icon.svg -background transparent -define icon:auto-resize=256,128,96,64,48,32,16 favicon.ico

# Genera PNG in diverse dimensioni
convert icon.svg -resize 16x16 favicon-16x16.png
convert icon.svg -resize 32x32 favicon-32x32.png
convert icon.svg -resize 192x192 icon-192x192.png
convert icon.svg -resize 512x512 icon-512x512.png
```

### Opzione 3: Script Node.js

Puoi creare uno script usando `sharp`:

```bash
npm install --save-dev sharp
```

```javascript
// scripts/generate-favicons.js
const sharp = require('sharp');

async function generateFavicons() {
  const sizes = [16, 32, 192, 512];

  for (const size of sizes) {
    await sharp('public/icon.svg')
      .resize(size, size)
      .png()
      .toFile(`public/icon-${size}x${size}.png`);
  }

  // Genera favicon.ico
  await sharp('public/icon.svg')
    .resize(32, 32)
    .toFile('public/favicon.ico');
}

generateFavicons();
```

## Verificare le Icone

Puoi verificare che le icone funzionino correttamente visitando:

1. **Chrome/Edge**: Apri DevTools → Application → Manifest
2. **Safari (iOS)**: Aggiungi il sito alla Home Screen e verifica l'icona
3. **Lighthouse**: Esegui un audit per verificare le PWA features

## Personalizzazione

### Cambiare il Colore Tema

Modifica il colore in:
- `site.webmanifest`: `"theme_color"`
- `browserconfig.xml`: `<TileColor>`
- `layout.tsx`: `meta name="theme-color"`

### Cambiare il Logo

1. Sostituisci `logo.svg` con il tuo logo
2. Aggiorna `icon.svg`, `favicon.svg`, e `apple-touch-icon.svg` con il nuovo design
3. Rigenera i formati PNG/ICO se necessario

### Aggiungere Nuove Dimensioni

Aggiungi nuove dimensioni nel `site.webmanifest`:

```json
{
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Riferimenti

- [Web App Manifest - MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Favicon Guide - RealFaviconGenerator](https://realfavicongenerator.net/favicon_best_practices)
- [PWA Basics - web.dev](https://web.dev/progressive-web-apps/)

## Note

- Le favicon SVG sono preferite perché sono vettoriali e si adattano a qualsiasi dimensione
- Il formato .ico è ancora necessario per la compatibilità con browser più vecchi
- L'apple-touch-icon dovrebbe essere quadrato e senza trasparenza
- Per i tile di Windows, usa il file `browserconfig.xml`
