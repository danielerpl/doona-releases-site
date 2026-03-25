# Doona Simulator - Distribution Site

Sito statico per l'installazione OTA (Over-The-Air) dell'app iOS Doona Peripheral Simulator.

## 📋 Prerequisiti

- Account Cloudflare
- Repository Bitbucket privato con i file di distribuzione
- Token API Bitbucket (x-bitbucket-api-token-auth)

## 🚀 Deploy su Cloudflare Pages

### 1. Configurazione delle variabili d'ambiente

Nel dashboard di Cloudflare Pages, aggiungi queste variabili d'ambiente:

| Variabile | Descrizione |
|-----------|-------------|
| `BITBUCKET_TOKEN` | Token API Bitbucket (es. `ATATT3x...`) |
| `IPA_PATH` | (Opzionale) Percorso IPA. Default: `Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa` |

### 2. Deploy

 Collegare il repository a Cloudflare Pages.
 - Build command: *(vuoto)*
 - Build output directory: `.` (root)
 - Commit e deploy automatico.

### 3. Verifica

 visitare l'URL del sito, cliccare il pulsante "Install Doona Simulator" e seguire le istruzioni su iPhone.

## 🛠️ Struttura del progetto

```
distribution-site/
├── index.html              # Pagina principale
├── functions/
│   ├── manifest.js         # Endpoint API per manifest.plist
│   └── ipa.js              # Endpoint API per .ipa
├── README.md
└── .gitignore
```

## 🔐 Sicurezza

Il token Bitbucket è memorizzato nelle variabili d'ambiente di Cloudflare e non è esposto al client.

Le Functions agiscono come proxy, autenticandosi a Bitbucket e servendo i file solo su richiesta.

## ⚠️ Note importanti

- L'IPA deve essere firmata con certificato **Ad Hoc** o **Enterprise**.
- I dispositivi iOS devono essere inclusi nel provisioning profile.
- Safari è obbligatorio per l'installazione OTA.# doona-releases-site
