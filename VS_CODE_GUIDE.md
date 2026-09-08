# 📘 Guida Completa: Come Far Girare il Progetto su Visual Studio Code

## 📋 Indice
1. [Prerequisiti](#prerequisiti)
2. [Setup in 5 Minuti (Automatico)](#setup-in-5-minuti-automatico)
3. [Setup Manuale Passo-Passo](#setup-manuale-passo-passo)
4. [Come Avviare il Progetto](#come-avviare-il-progetto)
5. [Risoluzione Problemi Comuni](#risoluzione-problemi-comuni)

---

## 🔧 Prerequisiti

### 1. **Node.js** (OBBLIGATORIO)
Scarica e installa da: https://nodejs.org/
- ✅ Versione 18 o superiore
- ✅ Scegli la versione **LTS** (Long Term Support)

**Verifica l'installazione:**
```bash
node --version
# Dovresti vedere qualcosa come: v20.x.x
```

### 2. **Gestore Pacchetti** (scegliene uno)

#### Opzione A: Bun (CONSIGLIATO - Più Veloce)
```bash
# Su Windows (PowerShell)
irm bun.sh/install.ps1 | iex

# Su Mac/Linux
curl -fsSL https://bun.sh/install | bash
```

#### Opzione B: npm (Già incluso con Node.js)
Non serve installare nulla se hai Node.js!

**Verifica:**
```bash
# Per Bun
bun --version

# Per npm
npm --version
```

### 3. **Visual Studio Code**
Scarica da: https://code.visualstudio.com/

### 4. **Estensioni VS Code Consigliate** (Opzionale ma utili)
- ESLint
- Prettier
- Prisma

---

## 🚀 Setup in 5 Minuti (Automatico)

### 🐧 Per Mac/Linux

1. **Apri il terminale** (in VS Code: `Ctrl + \`` o `Terminal > New Terminal`)

2. **Vai nella cartella del progetto:**
```bash
cd /percorso/della/tuacartella/my-project
```

3. **Rendi eseguibile lo script:**
```bash
chmod +x setup.sh
```

4. **Esegui lo script:**
```bash
./setup.sh
```

5. **Attendi che finisca** (circa 2-3 minuti)

6. **Avvia il server:**
```bash
bun run dev
# oppure
npm run dev
```

### 🪟 Per Windows

1. **Apri PowerShell** (in VS Code: `Ctrl + \`` o `Terminal > New Terminal`)

2. **Vai nella cartella del progetto:**
```powershell
cd C:\percorso\della\tuacartella\my-project
```

3. **Esegui lo script PowerShell:**
```powershell
.\setup.ps1
```

⚠️ **Se ricevi un errore di esecuzione script:**
- Apri PowerShell come **Amministratore**
- Esegui: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Riprova: `.\setup.ps1`

4. **Attendi che finisca** (circa 2-3 minuti)

5. **Avvia il server:**
```powershell
bun run dev
# oppure
npm run dev
```

---

## 📝 Setup Manuale Passo-Passo

Se lo script automatico non funziona, segui questi passi:

### Step 1: Installa le Dipendenze

**Con Bun:**
```bash
bun install
```

**Con npm:**
```bash
npm install
```

⏱️ **Tempo stimato:** 1-2 minuti

---

### Step 2: Configura l'Ambiente

Crea un file chiamato `.env` nella radice del progetto:

**Contenuto del file `.env`:**
```
DATABASE_URL="file:./db/custom.db"
```

In VS Code:
1. Clic destro su `my-project` → `New File`
2. Nome: `.env`
3. Incolla il contenuto sopra
4. Salva (`Ctrl + S`)

---

### Step 3: Crea la Cartella Database

**Terminale:**
```bash
mkdir db
```

In VS Code:
1. Clic destro su `my-project` → `New Folder`
2. Nome: `db`

---

### Step 4: Configura il Database

**Con Bun:**
```bash
bun run db:push
bun run db:generate
```

**Con npm:**
```bash
npm run db:push
npm run db:generate
```

⚠️ Se ricevi errori qui, assicurati che il file `.env` sia stato creato correttamente!

---

### Step 5: Popola il Database con Dati di Esempio

**Con Bun:**
```bash
bun run db:seed
```

**Con npm:**
```bash
npm run db:seed
```

Dovresti vedere:
```
🌱 Inizio seed del database...
✅ Creati 14 allergeni
✅ Create 5 categorie
✅ Creati 6 articoli
...
🎉 Seed completato con successo!
```

---

### Step 6: Verifica le Cartelle

Assicurati che esistano queste cartelle:
```
my-project/
├── db/                    (creata)
├── public/
│   └── images/           (creata)
├── node_modules/          (creata da npm/bun)
├── .env                  (creato)
└── prisma/
```

Se mancano, creale manualmente in VS Code.

---

## 🎯 Come Avviare il Progetto

### Opzione A: Dal Terminale VS Code

1. **Apri il terminale** in VS Code (`Ctrl + \``)

2. **Avvia il server:**

**Con Bun:**
```bash
bun run dev
```

**Con npm:**
```bash
npm run dev
```

3. **Vedi il messaggio di successo:**
```
✓ Ready in xxx ms
○ Local: http://localhost:3000
```

4. **Apri il browser:**
- Vai su: `http://localhost:3000`
- Il sito dovrebbe essere visibile!

---

### Opzione B: Con Task VS Code

1. In VS Code, vai su `View > Run and Debug`
2. Clicca su "Run and Debug"
3. Scegli "Next.js: dev server"

---

### Opzione C: Avvio rapido con script

Crea un file `start.sh` (Mac/Linux) o `start.bat` (Windows):

**start.sh (Mac/Linux):**
```bash
#!/bin/bash
bun run dev
```

**start.bat (Windows):**
```batch
@echo off
bun run dev
pause
```

Poi clicca due volte sul file!

---

## 🔍 Verifica che Funzioni Tutto

Dopo aver avviato il server, controlla:

### 1. Homepage
✅ Vai su `http://localhost:3000`
✅ Vedi Hero section con immagine
✅ Vedi sezione Chi Siamo
✅ Vedi carosello Specialità

### 2. Pagina Menu
✅ Clicca su "Menu" nell'header
✅ Vedi gli articoli organizzati per categoria
✅ Passa il mouse sugli allergeni → vedi tooltip
✅ Vedi prezzi e promozioni

### 3. Admin Panel
✅ Clicca su "Admin" nell'header
✅ Email: `admin@labellatavola.it`
✅ Password: `admin123`
✅ Puoi vedere e modificare categorie, articoli, ecc.

---

## 🐛 Risoluzione Problemi Comuni

### ❌ Problema: "command not found: node"
**Soluzione:**
- Node.js non è installato o non è nel PATH
- Scarica e installa da: https://nodejs.org/
- Riavvia VS Code dopo l'installazione

---

### ❌ Problema: "bun: command not found" o "npm: command not found"
**Soluzione:**
- Verifica che Node.js sia installato: `node --version`
- Se npm non funziona, reinstalla Node.js
- Per Bun, segui le istruzioni di installazione sopra

---

### ❌ Problema: "Error: DATABASE_URL not found"
**Soluzione:**
- Crea il file `.env` nella cartella radice del progetto
- Assicurati che contenga: `DATABASE_URL="file:./db/custom.db"`
- Assicurati di non avere spazi extra o caratteri speciali

---

### ❌ Problema: "Prisma Client not found"
**Soluzione:**
```bash
bun run db:generate
# oppure
npm run db:generate
```

---

### ❌ Problema: "Port 3000 is already in use"
**Soluzione 1:** Chiudi l'altro processo che usa la porta 3000

**Soluzione 2:** Usa una porta diversa:
```bash
# Su Mac/Linux
lsof -ti:3000 | xargs kill -9

# Su Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <NUMERO_PID> /F
```

**Soluzione 3:** Cambia porta nel file `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

---

### ❌ Problema: "Cannot find module"
**Soluzione:**
```bash
# Reinstalla le dipendenze
rm -rf node_modules package-lock.json  # Mac/Linux
# oppure
rmdir /s /q node_modules  # Windows

# Poi reinstalla
bun install
# oppure
npm install
```

---

### ❌ Problema: Le immagini non si vedono
**Soluzione:**
- Assicurati che la cartella `public/images` esista
- Verifica che le immagini siano in quella cartella
- I percorsi nel database dovrebbero essere: `/images/nomefile.jpg`

---

### ❌ Problema: Il database è vuoto
**Soluzione:**
```bash
bun run db:seed
# oppure
npm run db:seed
```

---

### ❌ Problema: Errore Prisma "Database file not found"
**Soluzione:**
```bash
# Crea la cartella db
mkdir db

# Ripeti il setup
bun run db:push
bun run db:seed
```

---

### ❌ Problema: TypeScript/Build errors
**Soluzione:**
```bash
# Pulisci i file di build
rm -rf .next
# oppure
rmdir /s /q .next

# Riavvia
bun run dev
```

---

## 📊 Controlla lo Stato del Sistema

Esegui questi comandi nel terminale per diagnosticare problemi:

```bash
# 1. Verifica Node.js
node --version

# 2. Verifica gestore pacchetti
bun --version
# oppure
npm --version

# 3. Verifica cartelle
ls -la  # Mac/Linux
# oppure
dir     # Windows

# 4. Verifica file .env
cat .env  # Mac/Linux
# oppure
type .env  # Windows

# 5. Controlla il database
ls db/  # Mac/Linux
# oppure
dir db\  # Windows
```

---

## 🎯 Checklist Prima di Iniziare

Prima di provare ad avviare il progetto, verifica:

- [ ] Node.js installato (v18+)
- [ ] Bun o npm installato
- [ ] Progetto estratto correttamente
- [ ] File `.env` creato nella cartella radice
- [ ] Cartella `db` creata
- [ ] Cartella `public/images` creata
- [ ] Dipendenze installate (`bun install` o `npm install`)
- [ ] Database configurato (`bun run db:push`)
- [ ] Database popolato (`bun run db:seed`)

---

## 📞 Aiuto e Supporto

Se ancora non funziona:

1. **Controlla il terminale:**
   - Leggi tutti i messaggi di errore
   - Copia l'errore preciso

2. **Verifica i file:**
   - `.env` deve contenere `DATABASE_URL`
   - `package.json` deve avere gli script corretti

3. **Prova in una nuova cartella:**
   - Estrai di nuovo l'archivio
   - Riparti da zero

4. **Controlla il firewall/antivirus:**
   - Potrebbe bloccare la porta 3000
   - Aggiungi un'eccezione per Node.js

---

## 🎉 Congratulazioni!

Se hai seguito tutti i passaggi, ora dovresti avere:
- ✅ Server in esecuzione su `http://localhost:3000`
- ✅ Database popolato con dati di esempio
- ✅ Sito funzionante con tutte le funzionalità

Buon lavoro con il tuo sito ristorante! 🍝✨
