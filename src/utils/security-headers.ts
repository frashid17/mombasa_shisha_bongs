/**
 * Security Headers Utility
 * 
 * Functions to add security headers to responses
 */

import { NextResponse } from 'next/server'

/**
 * Security headers configuration
 */
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy (restrict browser features)
  // Allow geolocation for location picker
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)', // Allow geolocation for location picker
    'interest-cohort=()',
  ].join(', '),
  
  // Content Security Policy
  // More permissive for Clerk CAPTCHA and Leaflet maps - allows all necessary domains
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://*.google.com https://www.google.com https://www.gstatic.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com data: https://*.clerk.com https://*.clerk.accounts.dev https://clerk.mombasashishabongs.com",
    "img-src 'self' data: https: blob: https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://www.google.com https://www.gstatic.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org",
    "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://api.resend.com https://api.twilio.com https://sandbox.safaricom.co.ke https://api.safaricom.co.ke https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://www.google.com https://www.gstatic.com https://*.tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org wss://*.clerk.com wss://clerk.mombasashishabongs.com",
    "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com https://*.hcaptcha.com https://hcaptcha.com https://js.hcaptcha.com https://www.google.com https://js.stripe.com",
    "worker-src 'self' blob: https://*.hcaptcha.com https://hcaptcha.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://*.clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://clerk.mombasashishabongs.com",
    "frame-ancestors 'none'",
    // Only upgrade insecure requests in production
    ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
  ].join('; '),
} as const

/**
 * Add security headers to a response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Add all security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  // Add HSTS header in production (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    )
  }

  return response
}

/**
 * Create a secure response with security headers
 */
export function createSecureResponse(
  data: any,
  status: number = 200,
  headers?: Record<string, string>
): NextResponse {
  const response = NextResponse.json(data, { status })

  // Add custom headers if provided
  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }

  // Add security headers
  return addSecurityHeaders(response)
}

