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
    console.log('📦 Fetching IPA from Bitbucket...');
    
    // Recupera l'IPA da Bitbucket usando l'endpoint raw
    // Usiamo il percorso specifico tipo: Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa
    const ipaPath = context.env.IPA_PATH || 'Releases/BLEPeripheralSimulator/Apps/DoonaPeripheralSimulator.ipa';
    const ipaUrl = `https://bitbucket.org/filotrack/doona-simulator-ios/raw/main/${ipaPath}`;

    // Bitbucket autenticazione: Bearer Token (modern API token)
    console.log(`📡 URL: ${ipaUrl}`);
    console.log(`🔐 Auth: Bearer ${token.substring(0, 20)}...`);

    const response = await fetch(ipaUrl, {
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

    const ipaBuffer = await response.arrayBuffer();
    console.log(`✅ IPA fetched, size: ${ipaBuffer.byteLength} bytes`);

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
