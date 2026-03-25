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

    // Test various Bitbucket endpoints with MULTIPLE auth methods
    const endpoints = [
      {
        name: 'Repository Info (API)',
        url: 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios'
      },
      {
        name: 'Whoami (API)',
        url: 'https://api.bitbucket.org/2.0/user'
      },
      {
        name: 'manifest.plist (raw)',
        url: 'https://bitbucket.org/filotrack/doona-simulator-ios/raw/main/Releases/BLEPeripheralSimulator/manifest.plist'
      }
    ];

    const results = [];

    // Test 1: Current method (x-bitbucket-api-token-auth)
    console.log('\n📝 Method 1: x-bitbucket-api-token-auth (current)');
    for (const endpoint of endpoints) {
      try {
        const auth = btoa(`x-bitbucket-api-token-auth:${token}`);
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json'
          },
          redirect: 'manual'
        });

        results.push({
          method: 'x-bitbucket-api-token-auth',
          endpoint: endpoint.name,
          url: endpoint.url,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        console.log(`  ${endpoint.name}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        results.push({
          method: 'x-bitbucket-api-token-auth',
          endpoint: endpoint.name,
          url: endpoint.url,
          status: null,
          ok: false,
          error: error.message.substring(0, 100)
        });

        console.log(`  ${endpoint.name}: ❌ ${error.message.substring(0, 50)}`);
      }
    }

    // Test 2: Bearer token method - MULTIPLE endpoints
    console.log('\n📝 Method 2: Bearer Token (EXTENDED)');
    const bearerTests = [
      { name: 'Whoami', url: 'https://api.bitbucket.org/2.0/user' },
      { name: 'Repository', url: 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios' },
      { name: 'Workspace', url: 'https://api.bitbucket.org/2.0/workspaces/filotrack' },
      { name: 'Token info', url: 'https://api.bitbucket.org/2.0/user/tokens/oauth2/app_password' }
    ];

    for (const test of bearerTests) {
      try {
        const response = await fetch(test.url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        results.push({
          method: 'Bearer',
          endpoint: test.name,
          url: test.url,
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        });

        console.log(`  ${test.name}: ${response.status} ${response.ok ? '✅' : '❌'}`);
      } catch (error) {
        results.push({
          method: 'Bearer',
          endpoint: test.name,
          url: test.url,
          status: null,
          ok: false,
          error: error.message.substring(0, 100)
        });

        console.log(`  ${test.name}: ❌ ${error.message.substring(0, 50)}`);
      }
    }

    // Test 3: Token as password with username
    console.log('\n📝 Method 3: Token as Password (username: filotrack)');
    try {
      const auth = btoa(`filotrack:${token}`);
      const response = await fetch('https://api.bitbucket.org/2.0/user', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      results.push({
        method: 'Basic (filotrack:token)',
        endpoint: 'Whoami',
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      console.log(`  Whoami (filotrack:token): ${response.status} ${response.ok ? '✅' : '❌'}`);
    } catch (error) {
      results.push({
        method: 'Basic (filotrack:token)',
        endpoint: 'Whoami',
        status: null,
        ok: false,
        error: error.message.substring(0, 100)
      });

      console.log(`  Whoami (filotrack:token): ❌ ${error.message.substring(0, 50)}`);
    }

    // Test 4: Token with underscore prefix (JSON key format)
    console.log('\n📝 Method 4: Token with _json_key_base64 prefix');
    try {
      const auth = btoa(`_json_key_base64:${token}`);
      const response = await fetch('https://api.bitbucket.org/2.0/user', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      results.push({
        method: 'Basic (_json_key_base64:token)',
        endpoint: 'Whoami',
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      console.log(`  Whoami (_json_key_base64:token): ${response.status} ${response.ok ? '✅' : '❌'}`);
    } catch (error) {
      results.push({
        method: 'Basic (_json_key_base64:token)',
        endpoint: 'Whoami',
        status: null,
        ok: false,
        error: error.message.substring(0, 100)
      });

      console.log(`  Whoami (_json_key_base64:token): ❌ ${error.message.substring(0, 50)}`);
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
