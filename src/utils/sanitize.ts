/**
 * Input Sanitization Utilities
 * 
 * Functions to sanitize user input and prevent XSS attacks
 */

/**
 * Sanitize HTML string to prevent XSS
 * Removes potentially dangerous HTML tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html) return ''

  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, '')

  // Remove data: URLs that could be dangerous
  sanitized = sanitized.replace(/data:text\/html/gi, '')

  return sanitized.trim()
}

/**
 * Sanitize plain text input
 * Removes HTML tags and normalizes whitespace
 */
export function sanitizeText(text: string): string {
  if (!text) return ''

  // Remove HTML tags
  let sanitized = text.replace(/<[^>]*>/g, '')

  // Decode HTML entities
  sanitized = sanitized
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim()

  return sanitized
}

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url) return ''

  // Remove javascript: protocol
  if (url.toLowerCase().startsWith('javascript:')) {
    return ''
  }

  // Remove data: URLs (except safe image types)
  if (url.toLowerCase().startsWith('data:')) {
    // Allow data:image URLs for base64 images
    if (url.toLowerCase().startsWith('data:image/')) {
      return url
    }
    return ''
  }

  // Ensure http or https protocol
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    // If it's a relative URL, allow it
    if (url.startsWith('./') || url.startsWith('../')) {
      return url
    }
    // Otherwise, assume it's meant to be https
    return `https://${url}`
  }

  return url
}

/**
 * Sanitize phone number
 * Only allows digits, +, and spaces
 */
export function sanitizePhone(phone: string): string {
  if (!phone) return ''

  // Remove all characters except digits, +, and spaces
  return phone.replace(/[^\d+\s]/g, '')
}

/**
 * Sanitize email address
 * Basic validation and sanitization
 */
export function sanitizeEmail(email: string): string {
  if (!email) return ''

  // Remove whitespace
  let sanitized = email.trim().toLowerCase()

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(sanitized)) {
    return ''
  }

  return sanitized
}

/**
 * Sanitize object recursively
 * Sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeText(sanitized[key]) as any
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  }

  return sanitized
}

/**
 * Escape HTML special characters
 * Converts <, >, &, ", ' to HTML entities
 */
export function escapeHtml(text: string): string {
  if (!text) return ''

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }

  return text.replace(/[&<>"']/g, (char) => map[char])
}

