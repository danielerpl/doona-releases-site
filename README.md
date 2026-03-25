# Doona Simulator - Distribution Site

Sito statico per l'installazione OTA (Over-The-Air) dell'app iOS Doona Peripheral Simulator.

## 📋 Prerequisiti

- Account Cloudflare con Cloudflare Pages
- Repository Bitbucket privato con i file di distribuzione
- Token API Bitbucket (App Password)

## 🔐 Configurazione Token Bitbucket

### Generare un nuovo Token (App Password)

1. Accedi a [Bitbucket](https://bitbucket.org)
2. Vai a **Personal Settings** → **App passwords** 
3. Clicca **Create app password**
4. Nome: `Doona Releases`
5. Permessi: Abilita solo ✅ `Repositories: Read`
6. **Copia il token** (non potrai vederlo di nuovo!)

### Aggiornare Token su Cloudflare

1. Vai su [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Seleziona **Pages** → `doona-releases-site`
3. Vai a **Settings** → **Environment variables**
4. Modifica la variabile `BITBUCKET_TOKEN`:
   - **Production**: Incolla il nuovo token
   - **Preview**: (opzionale) Stesso token per testare in preview
5. Clicca **Save and deploy**

## 🚀 Deploy su Cloudflare Pages

### 1. Configurazione iniziale

Se non hai ancora il progetto su Cloudflare:

1. Collega il repository GitHub a Cloudflare Pages
2. Build command: *(vuoto)* (è un sito statico con Workers)
3. Build output directory: `.` (root)

### 2. Configurazione Variabili d'Ambiente

Nel dashboard di Cloudflare Pages, vai a **Settings → Environment variables** e aggiungi:

| Variabile | Valore | Descrizione |
|-----------|--------|-----------|
| `BITBUCKET_TOKEN` | `ATATT3x...` | Token API Bitbucket (App Password) |
| `IPA_PATH` | `Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa` | (Opzionale) Percorso IPA. Default: vedi sopra |

### 3. Deploy

- Commit e push al branch collegato (solitamente `main`)
- Cloudflare deploierà automaticamente

## 🧪 Test e Debug

### Endpoint di Debug

Una volta deployato, puoi testare gli endpoint direttamente:

```bash
# Test configurazione e autenticazione Bitbucket
curl https://doona-releases-site.pages.dev/api/debug

# Test download manifest
curl https://doona-releases-site.pages.dev/api/manifest

# Test download IPA
curl https://doona-releases-site.pages.dev/api/ipa -o DoonaPeripheralSimulator.ipa
```

### Debug da Cloudflare Logs

1. Vai su **Cloudflare Dashboard** → **Pages** → `doona-releases-site`
2. Seleziona **Deployments**
3. Clicca l'ultimo deployment
4. **View build logs** per vedere output del build
5. **View runtime logs** per vedere traffic e errori

## 📂 Struttura Progetto

```
distribution-site/
├── index.html                  # Pagina principale installazione
├── functions/
│   ├── api/
│   │   ├── manifest.js         # GET /api/manifest - Restituisce manifest.plist
│   │   ├── ipa.js              # GET /api/ipa - Restituisce .ipa
│   │   └── debug.js            # GET /api/debug - Test autenticazione Bitbucket
│   └── [_middleware.js]        # (Opzionale) Middleware per CORS
├── README.md
└── .gitignore
```

## 🔗 Repository Bitbucket

- **URL**: https://bitbucket.org/filotrack/doona-simulator-ios/
- **Files location**: `/Releases/BLEPeripheralSimulator/`
- **Manifest**: `manifest.plist`
- **IPA**: `Apps/DoonaPeripheralSimulator.ipa`

## ⚠️ Troubleshooting

### Errore: "Server configuration error: missing BITBUCKET_TOKEN"

❌ **Causa**: Token non configurato nelle variabili d'ambiente di Cloudflare

**Soluzione**:
1. Vai a **Cloudflare Pages Settings → Environment variables**
2. Aggiungi `BITBUCKET_TOKEN` con il token da Bitbucket
3. Redeploy (`git push` o manual deploy)

### Errore: "Bitbucket error: 401"

❌ **Causa**: Token invalido o senza permessi

**Soluzione**:
1. Verifica il token in Bitbucket → **Personal Settings → App passwords**
2. Se scaduto o invalido, genera un **nuovo token**
3. Aggiorna il token su Cloudflare Pages
4. Redeploy

### Errore: "Bitbucket error: 404"

❌ **Causa**: Repository o file non trovati

**Soluzione**:
1. Verifica che il repository URL sia esatto
2. Verifica che il percorso dei file sia: `Releases/BLEPeripheralSimulator/`
3. Controlla il nome esatto di `manifest.plist` e `DoonaPeripheralSimulator.ipa`
4. Usa l'endpoint `/api/debug` per diagnosticare il problema

### Come verificare usando /api/debug

Accedi a `https://doona-releases-site.pages.dev/api/debug` e guarda i risultati:

```json
{
  "results": [
    {
      "endpoint": "Repository Info",
      "status": 200,
      "ok": true
    },
    ...
  ]
}
```

Se lo status è **401**: Token invalido
Se lo status è **404**: Repository o file non trovato
Se lo status è **200**: ✅ Tutto OK!

## 🔐 Sicurezza

- ✅ Token Bitbucket memorizzato **solo** nelle variabili d'ambiente di Cloudflare
- ✅ Token **non è mai** esposto al client/browser
- ✅ Cloudflare Workers agiscono come **proxy autenticato**
- ✅ File serviti solo con autenticazione valida a Bitbucket

## 📱 Installazione su iPhone

1. Apri Safari su iPhone
2. Visita: https://doona-releases-site.pages.dev
3. Clicca il bottone **"Install Doona Simulator (Latest Build)"**
4. Segui le istruzioni su schermo
5. L'app verrà installata in background su iPhone

## ⚠️ Note importanti

- L'IPA deve essere firmata con certificato **Ad Hoc** o **Enterprise**.
- I dispositivi iOS devono essere inclusi nel provisioning profile.
- Safari è obbligatorio per l'installazione OTA.# doona-releases-site
