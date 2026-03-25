export async function onRequestGet(context) {
  const token = context.env.BITBUCKET_TOKEN;

  if (!token) {
    console.error('❌ BITBUCKET_TOKEN not configured');
    return new Response(
      JSON.stringify({ error: 'Server configuration error: missing BITBUCKET_TOKEN' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('📦 Fetching version from DistributionSummary.plist...');
    
    const summaryUrl = 'https://api.bitbucket.org/2.0/repositories/filotrack/doona-simulator-ios/src/main/Releases/BLEPeripheralSimulator/DistributionSummary.plist';

    const response = await fetch(summaryUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error(`❌ Failed to fetch DistributionSummary: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Failed to fetch version: ${response.status}` }),
        { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const plistContent = await response.text();
    
    // Parse plist to extract versionNumber and buildNumber
    // Simple regex extraction - looks for the version and build number values
    const versionMatch = plistContent.match(/<key>versionNumber<\/key>\s*<string>([^<]+)<\/string>/);
    const buildMatch = plistContent.match(/<key>buildNumber<\/key>\s*<string>([^<]+)<\/string>/);

    const version = versionMatch ? versionMatch[1] : '1.0';
    const build = buildMatch ? buildMatch[1] : '1';

    console.log(`✅ Version: ${version}, Build: ${build}`);

    return new Response(
      JSON.stringify({
        version: version,
        build: build,
        displayVersion: `${version} (Build ${build})`
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=3600'
        }
      }
    );
  } catch (error) {
    console.error('❌ Error fetching version:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
