export async function onRequestGet(context) {
  const token = context.env.BITBUCKET_TOKEN;

  if (!token) {
    return new Response('Server configuration error: missing BITBUCKET_TOKEN', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }

  try {
    // Recupera l'IPA da Bitbucket
    // Usiamo il percorso specifico tipo: Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa
    const ipaPath = context.env.IPA_PATH || 'Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa';
    const ipaUrl = `https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios/src/main/${ipaPath}`;

    const auth = btoa(`x-bitbucket-api-token-auth:${token}`);

    const response = await fetch(ipaUrl, {
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

    const ipaBuffer = await response.arrayBuffer();

    return new Response(ipaBuffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="DoonaPeripheralSimulator.ipa"',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (error) {
    return new Response(`Server error: ${error.message}`, {
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
