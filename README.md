# Doona Simulator - Distribution Site

Static site for OTA (Over-The-Air) installation of the Doona Peripheral Simulator iOS app through a Cloudflare Workers proxy.

## 📋 Prerequisites

- Cloudflare account with Cloudflare Pages
- Private Bitbucket repository with release files
- Bitbucket API token (Bearer Token)

## 🔐 Bitbucket Token Configuration

### Generate a New API Token

1. Sign in to [Bitbucket](https://bitbucket.org)
2. Go to **Personal Settings** → **App passwords** 
3. Click **Create app password**
4. Name: `Doona Releases`
5. Permissions: Enable only ✅ `Repositories: Read`
6. **Copy the token** (you won't be able to see it again!)

### Update Token on Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Pages** → `doona-releases-site`
3. Go to **Settings** → **Environment variables**
4. Update the `BITBUCKET_TOKEN` variable:
   - **Production**: Paste the new token
   - **Preview**: (optional) Same token for preview testing
5. Click **Save and deploy**

## 🚀 Deploy to Cloudflare Pages

### 1. Initial Setup

If you haven't deployed to Cloudflare yet:

1. Connect your GitHub repository to Cloudflare Pages
2. Build command: *(empty)* (static site with Workers functions)
3. Build output directory: `.` (root)

### 2. Environment Variables Configuration

In the Cloudflare Pages dashboard, go to **Settings → Environment variables** and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `BITBUCKET_TOKEN` | `ATCTT3x...` | Bitbucket API Bearer Token |
| `IPA_PATH` | `Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa` | (Optional) IPA file path. Default: see above |

### 3. Deploy

- Commit and push to the connected branch (usually `main`)
- Cloudflare will deploy automatically

## 🧪 Testing & Debugging

### Available Endpoints

```bash
# Get current app version and build number
curl https://doona-releases-site.pages.dev/api/version
# Returns: {"version":"1.0","build":"1","displayVersion":"1.0 (Build 1)"}

# Download manifest.plist
curl https://doona-releases-site.pages.dev/api/manifest

# Download IPA binary
curl https://doona-releases-site.pages.dev/api/ipa -o DoonaPeripheralSimulator.ipa

# Test Bitbucket authentication
curl https://doona-releases-site.pages.dev/api/debug
```

### Cloudflare Logs

1. Go to **Cloudflare Dashboard** → **Pages** → `doona-releases-site`
2. Select **Deployments**
3. Click the latest deployment
4. **View build logs** to see build output
5. **View runtime logs** to see traffic and errors

## 📂 Project Structure

```
distribution-site/
├── index.html                  # Installation landing page
├── functions/
│   ├── api/
│   │   ├── manifest.js         # GET /api/manifest - Returns manifest.plist
│   │   ├── ipa.js              # GET /api/ipa - Returns .ipa binary
│   │   ├── version.js          # GET /api/version - Returns version info
│   │   └── debug.js            # GET /api/debug - Bitbucket auth test
│   └── [_middleware.js]        # (Optional) CORS middleware
├── README.md
└── .gitignore
```

## 🔗 Bitbucket Repository

- **URL**: https://bitbucket.org/filotrack/doona-simulator-ios/
- **Files location**: `/Releases/BLEPeripheralSimulator/`
- **Manifest**: `manifest.plist` (OTA manifest with app metadata)
- **IPA**: `Apps/DoonaPeripheralSimulator.ipa` (main app binary)
- **Version Info**: `DistributionSummary.plist` (extracted by /api/version)

## 🔄 How It Works

1. **User visits homepage** → Downloads manifest from `/api/manifest`
2. **Manifest handler** → Fetches from Bitbucket with Bearer token, rewrites URLs to point to `/api/ipa`
3. **iOS device requests IPA** → `/api/ipa` fetches from Bitbucket and returns binary
4. **Version display** → `/api/version` reads DistributionSummary.plist to show build info

## ⚠️ Troubleshooting

### Error: "Server configuration error: missing BITBUCKET_TOKEN"

❌ **Cause**: Token not configured in Cloudflare environment variables

**Solution**:
1. Go to **Cloudflare Pages Settings → Environment variables**
2. Add `BITBUCKET_TOKEN` with your Bitbucket token
3. Redeploy (`git push` or manual deploy)

### Error: "Bitbucket error: 401"

❌ **Cause**: Invalid or expired token

**Solution**:
1. Check token in Bitbucket → **Personal Settings → App passwords**
2. If expired, generate a **new token**
3. Update token on Cloudflare Pages
4. Redeploy

### Error: "Bitbucket error: 404"

❌ **Cause**: Repository or file not found

**Solution**:
1. Verify repository URL is correct
2. Verify file path: `Releases/BLEPeripheralSimulator/`
3. Check exact filenames: `manifest.plist` and `DoonaPeripheralSimulator.ipa`
4. Use `/api/debug` endpoint to diagnose

### Using /api/debug for Diagnosis

Visit `https://doona-releases-site.pages.dev/api/debug` and check responses:

```
Status 200 = ✅ OK
Status 401 = ❌ Token invalid
Status 404 = ❌ Repository or file not found
```

## 🔐 Security

- ✅ Bitbucket token stored **only** in Cloudflare environment variables
- ✅ Token **never exposed** to client/browser
- ✅ Cloudflare Workers act as **authenticated proxy**
- ✅ Files only served with valid Bitbucket authentication

## 📱 iPhone Installation

1. Open Safari on iPhone
2. Visit: https://doona-releases-site.pages.dev
3. Click **"Install Doona Simulator (Latest Build)"**
4. Follow on-screen instructions
5. App installs in background

## ⚠️ Important Notes

- IPA must be signed with **Ad Hoc** or **Enterprise** certificate
- iOS devices must be included in the provisioning profile
- Safari is required for OTA installation (itms-services:// protocol)
- Manifest only supports main IPA (thinned variants removed for simplicity)
