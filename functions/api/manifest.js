export async function onRequestGet(context) {
  const token = context.env.BITBUCKET_TOKEN;

  if (!token) {
    console.error('❌ BITBUCKET_TOKEN not configured');
    return new Response('Server configuration error: missing BITBUCKET_TOKEN. Configure it in Cloudflare Pages Environment Variables.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    console.log('📋 Fetching manifest.plist from Bitbucket...');
    
    // Recupera il manifest da Bitbucket usando l'endpoint API (il raw endpoint non supporta Bearer token)
    const manifestUrl = 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios/src/main/Releases/BLEPeripheralSimulator/manifest.plist';

    // Bitbucket autenticazione: Bearer Token (modern API token)
    console.log(`📡 URL: ${manifestUrl}`);
    console.log(`🔐 Auth: Bearer ${token.substring(0, 20)}...`);

    const response = await fetch(manifestUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Bitbucket API error: ${response.status}`);
      console.error(`Error details: ${errorText.substring(0, 200)}`);
      return new Response(`Bitbucket error: ${response.status} - ${errorText}`, {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Leggi il contenuto del manifest
    const manifestContent = await response.text();
    console.log(`✅ Manifest fetched, size: ${manifestContent.length} bytes`);

    // Modifica l'URL dell'IPA nel manifest per puntare al nostro endpoint /api/ipa
    // Cerca l'asset di tipo software-package e sostituisce l'URL
    const host = context.request.headers.get('host');
    const modifiedManifest = manifestContent.replace(
      /(<key>kind<\/key>\s*<string>software-package<\/string>[\s\S]*?<key>url<\/key>\s*<string>)([^<]+)(<\/string>)/i,
      `$1https://${host}/api/ipa$3`
    );

    return new Response(modifiedManifest, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600' // cache 1 ora
      }
    });

  } catch (error) {
    return new Response(`Server error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
