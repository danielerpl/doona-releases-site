export async function onRequestGet(context) {
  const token = context.env.BITBUCKET_TOKEN;

  if (!token) {
    return new Response('Server configuration error: missing BITBUCKET_TOKEN', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    // Recupera il manifest da Bitbucket
    const manifestUrl = 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios/src/main/Releases/BLEPeripheralSimulator/manifest.plist';

    // Bitbucket API autenticazione: Basic con username "x-bitbucket-api-token-auth" e password = token
    const auth = btoa(`x-bitbucket-api-token-auth:${token}`);

    const response = await fetch(manifestUrl, {
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(`Bitbucket error: ${response.status} - ${errorText}`, {
        status: response.status,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    // Leggi il contenuto del manifest
    const manifestContent = await response.text();

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
