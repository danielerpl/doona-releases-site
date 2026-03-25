# 🔒 Security Policy

## Overview

This document outlines the security practices and measures implemented in the Doona Distribution Site.

## Security Architecture

### Token Protection

- ✅ Bitbucket API token stored **only** in Cloudflare environment variables
- ✅ Token accessed server-side by Workers, never exposed to client
- ✅ Token logged with masking (Bearer xxxx...)
- ✅ All Bitbucket API calls use Bearer token authentication

### Authentication

- **Server-side token**: Cloudflare Workers authenticate to Bitbucket
- **No client authentication**: Public OTA endpoints (required by iOS OTA specification)
- **Bitbucket API**: Private repository access protected by Bearer token

### Input Validation

- ✅ File paths read from environment variables only
- ✅ No user input used to construct API URLs
- ✅ Query parameters sanitized and validated
- ✅ Protected against path traversal attacks

## HTTPS & Transport Security

- ✅ **HTTPS Enforced**: All traffic encrypted via TLS
- ✅ **HSTS**: Strict-Transport-Security via Cloudflare
- ✅ **DNS Security**: Protected by Cloudflare nameservers

## HTTP Security Headers

```
X-Content-Type-Options: nosniff          ✅ Prevents MIME sniffing
Referrer-Policy: strict-origin-when-cross-origin  ✅ Controls referrer info
```

## Recommended Security Enhancements

### Add Content-Security-Policy

Add to `_middleware.js` or Cloudflare Page Rules:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'
```

### Add X-Frame-Options

```
X-Frame-Options: DENY
```

### Rate Limiting

Configure in Cloudflare Dashboard:

1. Go to **Security** → **Rate limiting**
2. Add rule for `/api/ipa`:
   - **Threshold**: 5 requests per hour
   - **Action**: Block for 24 hours

### DDoS Protection

- ✅ Enabled by default on Cloudflare
- ✅ Managed rules automatically updated

## API Endpoint Security

| Endpoint | Public | Purpose | Risk |
|----------|--------|---------|------|
| `/` | Yes | Homepage | None |
| `/api/manifest` | Yes | OTA manifest (required) | Low |
| `/api/ipa` | Yes | App binary download | Low |
| `/api/version` | Yes | Version info | Low |
| `/api/debug` | Yes | Auth testing | Low |

**Note**: Public endpoints are required for iOS OTA installation to work.

## CORS Policy

Current: `Access-Control-Allow-Origin: *`

**Assessment**: Acceptable for public OTA endpoints
**Future**: Consider restricting to known domains if needed

## Incident Response

### If Token is Compromised

1. **Revoke immediately**:
   - Go to Bitbucket Personal Settings → App passwords
   - Delete compromised token

2. **Generate new token**:
   - Create new App password with read-only access
   - Copy token

3. **Update Cloudflare**:
   - Go to Pages Settings → Environment variables
   - Update `BITBUCKET_TOKEN`
   - Save and deploy

4. **Verify**:
   - Test `/api/debug` endpoint
   - Check deployment logs

## Monitoring & Logging

### Cloudflare Analytics

1. Go to **Analytics & Logs** → **HTTP Requests**
2. Monitor for:
   - Unusual number of 401 errors (auth failures)
   - Rapid downloads from single IP (abuse)
   - 5xx errors (infrastructure issues)

### Worker Logs

1. Go to **Deployments** → Latest
2. Click **View runtime logs** to see:
   - API requests and responses
   - Token validation
   - Bitbucket API calls

## Best Practices

### For Developers

- ✅ Never commit tokens to git
- ✅ Use `.gitignore` for sensitive files
- ✅ Test locally with dummy tokens
- ✅ Review logs before deploying

### For Operations

- ✅ Rotate tokens periodically (every 90 days)
- ✅ Monitor analytics for abuse patterns
- ✅ Keep Cloudflare security settings updated
- ✅ Review access logs monthly

### For Users

- ✅ Use the official link: https://doona-releases-site.pages.dev
- ✅ Only install from Safari on iPhone/iPad
- ✅ Verify app developer before installing
- ✅ Report suspicious activity

## Security Updates

Subscribe to security announcements:

- 🔔 Cloudflare Security Blog: https://blog.cloudflare.com
- 🔔 Bitbucket Security Updates: https://bitbucket.org/account/notifications

## Compliance & Standards

This application follows:

- ✅ OWASP Top 10 Security Guidelines
- ✅ Cloudflare Security Best Practices
- ✅ Apple App Transport Security (ATS) requirements
- ✅ REST API Security Standards

## Contact & Reporting

To report security vulnerabilities:

1. **Do NOT** open a public issue
2. Send details privately to: [daniele.rapali@gmail.com]
3. Include: description, steps to reproduce, impact assessment

---

**Last Updated**: 2026-03-25  
**Status**: ✅ Security Review Complete  
**Next Review**: 2026-06-25
