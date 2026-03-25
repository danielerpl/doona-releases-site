// Cloudflare Pages Middleware for Security Headers
export const onRequest = [addSecurityHeaders];

async function addSecurityHeaders(context) {
  const response = await context.next();
  
  // Clone response to add headers
  const newResponse = new Response(response.body, response);
  
  // Content Security Policy
  newResponse.headers.set(
    'Content-Security-Policy',
    "default-src 'self' https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'"
  );
  
  // X-Frame-Options - Prevent clickjacking
  newResponse.headers.set('X-Frame-Options', 'DENY');
  
  // X-Content-Type-Options - Already set by CF, but explicit is good
  newResponse.headers.set('X-Content-Type-Options', 'nosniff');
  
  // X-XSS-Protection - Legacy but useful
  newResponse.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Permissions-Policy - Restrict browser features
  newResponse.headers.set(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );
  
  // Referrer-Policy
  newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return newResponse;
}
