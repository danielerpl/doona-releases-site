export async function onRequestGet(context) {
  const token = context.env.BITBUCKET_TOKEN;

  if (!token) {
    return new Response(
      JSON.stringify({
        status: 'ERROR',
        message: 'Server configuration error: missing BITBUCKET_TOKEN',
        hint: 'Set BITBUCKET_TOKEN in Cloudflare Pages environment variables'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('🔍 Debug: Testing Bitbucket authentication...');

    // Test various Bitbucket endpoints
    const endpoints = [
      {
        name: 'Repository Info',
        url: 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios'
      },
      {
        name: 'Whoami',
        url: 'https://api.bitbucket.org/2.0/user'
      },
      {
        name: 'Releases Directory',
        url: 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios/src/main/Releases/'
      },
      {
        name: 'manifest.plist (raw)',
        url: 'https://bitbucket.org/filotrack/doona-simulator-ios/raw/main/Releases/BLEPeripheralSimulator/manifest.plist'
      }
    ];

    const results = [];

    for (const endpoint of endpoints) {
      try {
        const auth = btoa(`x-bitbucket-api-token-auth:${token}`);

        const response = await fetch(endpoint.url, {
          method: endpoint.url.includes('/raw/') ? 'HEAD' : 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          timeout: 10000
        });

        results.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        console.log(`  ${endpoint.name}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        results.push({
          endpoint: endpoint.name,
          url: endpoint.url,
          status: null,
          ok: false,
          error: error.message
        });

        console.log(`  ${endpoint.name}: ❌ ${error.message}`);
      }
    }

    return new Response(
      JSON.stringify(
        {
          status: 'DEBUG',
          timestamp: new Date().toISOString(),
          results: results,
          hint: 'Check results array to see which endpoints fail'
        },
        null,
        2
      ),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'ERROR',
        message: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
