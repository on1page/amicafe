# Pagine di Errore Personalizzate

Questo progetto include pagine di errore personalizzate per migliorare l'esperienza utente e mantenere il branding del ristorante.

## Pagine Implementate

### 1. Pagina 404 (Not Found)
**File:** `src/app/not-found.tsx`

Questa pagina viene mostrata quando:
- L'utente accede a un URL inesistente
- Una risorsa non viene trovata

**Caratteristiche:**
- ✅ Design coerente con il tema del ristorante
- ✅ Illustrazione con emoji 🍝
- ✅ Messaggio amichevole e in tema cucina
- ✅ Link utili (Home, Menu)
- ✅ Sezione "Cosa stavi cercando?" con quick links
- ✅ Animazioni decorative
- ✅ Footer semplificato con link ai contatti

### 2. Pagina Errore Generica
**File:** `src/app/error.tsx`

Questa pagina viene mostrata quando:
- Si verifica un errore server-side
- C'è un'eccezione non gestita
- Un componente crasha

**Caratteristiche:**
- ✅ Icona di avviso con animazione pulse
- ✅ Messaggio di scuse professionale
- ✅ Dettagli errore (solo in development)
- ✅ Pulsante "Riprova" per tentare di recuperare
- ✅ Link alla Home
- ✅ Suggerimenti per l'utente
- ✅ Error ID per debug (in produzione)
- ✅ Footer con contatti

## Come Testare

### Testare la Pagina 404

**Metodo 1: URL Inesistente**
1. Vai al sito nel browser
2. Nella barra degli indirizzi, scrivi un URL inesistente, ad esempio:
   - `http://localhost:3000/pagina-inesistente`
   - `http://localhost:3000/abcd1234`
3. Premi Invio
4. Dovresti vedere la pagina 404 personalizzata

**Metodo 2: Da Link Rotto**
1. Aggiungi un link temporaneo che punta a una pagina inesistente
2. Clicca sul link
3. Verifica che appaia la pagina 404

### Testare la Pagina Errore

**Metodo 1: Trigger Intenzionale (Development)**
1. Apri un componente e aggiungi un errore temporaneo:
   ```tsx
   // In qualsiasi client component
   useEffect(() => {
     throw new Error('Test error page')
   }, [])
   ```
2. Salva il file
3. Ricarica la pagina
4. Dovresti vedere la pagina di errore con i dettagli

**Metodo 2: API Error**
1. Chiama un endpoint che non esiste:
   ```bash
   curl http://localhost:3000/api/test-error
   ```
2. Se l'endpoint ritorna un errore, la pagina di errore apparirà

**Metodo 3: Error Boundary**
1. Crea un componente che lancia un errore:
   ```tsx
   'use client'

   export default function ErrorTrigger() {
     throw new Error('Test error boundary')
   }
   ```
2. Usa questo componente nella pagina
3. La pagina di errore verrà mostrata

## Dettagli Tecnici

### next.config.ts
Nessuna configurazione speciale è richiesta. Next.js 13+ con App Router gestisce automaticamente:
- `not-found.tsx` → Route `/not-found` e 404 errors
- `error.tsx` → Errori globali

### Meta Tags
Le pagine di errore ereditano il layout principale, quindi includono:
- ✅ Favicon e theme color
- ✅ Meta tags SEO base
- ✅ Link ai social media
- ✅ Cookie banner (se abilitato)

### Stili
Le pagine usano:
- Tailwind CSS per lo styling
- Componenti shadcn/ui (Button, Card)
- Gradienti e animazioni CSS
- Design responsive (mobile-first)

## Personalizzazione

### Modificare il Design 404
Apri `src/app/not-found.tsx` e modifica:
- Testo del titolo e descrizione
- Emoji dell'illustrazione
- Colori dei pulsanti
- Link nella sezione "Cosa stavi cercando?"

Esempio:
```tsx
<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
  {/* Cambia questo testo */}
  Ops! Piatto non trovato
</h1>

{/* Cambia l'emoji */}
<div className="text-9xl mb-4">🍝</div>
```

### Modificare il Design Errore
Apri `src/app/error.tsx` e modifica:
- Messaggi di errore
- Azioni disponibili
- Suggerimenti per l'utente

Esempio:
```tsx
<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
  {/* Cambia questo testo */}
  Ops! Qualcosa è andato storto
</h1>
```

### Aggiungere Nuovi Link
Nella pagina 404, aggiungi nuovi link nella sezione "Cosa stavi cercando":

```tsx
<Link href="/nuova-pagina" className="...">
  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Icon className="w-8 h-8 text-orange-600" />
  </div>
  <h3 className="font-semibold text-gray-900 mb-2">Nuova Pagina</h3>
  <p className="text-sm text-gray-600">Descrizione</p>
</Link>
```

## Best Practices

### Per la Pagina 404
- ✅ Mantieni il tono amichevole e in tema
- ✅ Fornisci link utili per aiutare l'utente
- ✅ Usa emoji o illustrazioni per rendere la pagina meno negativa
- ✅ Assicurati che sia mobile-friendly
- ✅ Includi un campo di ricerca (opzionale)

### Per la Pagina Errore
- ✅ Scusati per l'inconveniente
- ✅ Fornisci opzioni chiare per procedere
- ✅ Nascondi dettagli tecnici in produzione
- ✅ Mostra error ID per debugging
- ✅ Fornisci contatti per supporto

## Analytics

Le pagine di errore possono essere tracciate usando il sistema di analytics esistente:

```tsx
// In not-found.tsx o error.tsx
import { useAnalytics } from '@/components/useAnalytics'

export default function NotFound() {
  const { trackPageView } = useAnalytics()

  useEffect(() => {
    trackPageView('/404')
  }, [trackPageView])

  // ... resto del componente
}
```

## SEO

### Per la Pagina 404
- Assicurati che la pagina restituisca status code 404 (Next.js lo fa automaticamente)
- Non indicizzare la pagina (robots: noindex)

### Per la Pagina Errore
- Non indicizzare la pagina (robots: noindex)
- Non inviare a Google Search Console

## Riferimenti

- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Custom Error Pages](https://nextjs.org/docs/app/api-reference/file-conventions/not-found)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)

## Note Importanti

⚠️ **Development vs Production:**
- In development, vedrai l'Error Overlay di Next.js
- In production, vedrai le pagine di errore personalizzate

⚠️ **Error ID:**
- Gli error ID sono generati automaticamente da Next.js
- Utile per tracciare errori specifici nei log

⚠️ **Componenti Client:**
- `error.tsx` DEVE essere un client component (`'use client'`)
- `not-found.tsx` può essere server component

## Troubleshooting

### La pagina 404 non appare
- Verifica che il file sia in `src/app/not-found.tsx`
- Ricarica il server dev (`Ctrl+C` e `bun run dev`)
- Assicurati di non avere una route catch-all `[[...slug]]` che gestisce tutto

### La pagina errore non appare
- Verifica che `error.tsx` sia un client component
- Controlla la console per errori
- In development, l'Error Overlay potrebbe nascondere la pagina personalizzata

### Dettagli errore visibili in produzione
- I dettagli errore sono mostrati solo se `NODE_ENV === 'development'`
- In produzione, l'utente vedrà solo il messaggio generico
- Gli error ID sono sempre visibili per debug
