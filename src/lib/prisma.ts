import { PrismaClient } from '@/generated/prisma'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Connection pool configuration for PostgreSQL (especially serverless providers like Neon)
const createPrismaClient = () => {
  const databaseUrl = process.env.DATABASE_URL
  
  // For Neon and other serverless Postgres providers, add connection pooling parameters
  // This helps prevent "connection closed" errors
  const prismaConfig: any = {
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }

  // Note: Connection pool parameters (connection_limit, pool_timeout) must be set in the DATABASE_URL
  // connection string itself, not in PrismaClient configuration.
  // 
  // Recommended DATABASE_URL format for production:
  // postgresql://user:pass@host/db?connection_limit=20&pool_timeout=20&pgbouncer=true
  //
  // If you're getting "connection pool timeout" errors, update your DATABASE_URL to include:
  // - connection_limit=20 (or higher, default is 5)
  // - pool_timeout=20 (or higher, default is 10 seconds)
  // - pgbouncer=true (for Neon/Supabase pooled connections)
  
  if (databaseUrl) {
    // Check if connection pool parameters are missing and log a warning
    const hasConnectionLimit = databaseUrl.includes('connection_limit=')
    const hasPoolTimeout = databaseUrl.includes('pool_timeout=')
    
    if (!hasConnectionLimit || !hasPoolTimeout) {
      console.warn('[Prisma] Connection pool parameters not found in DATABASE_URL.')
      console.warn('  Recommended: Add ?connection_limit=20&pool_timeout=20 to your DATABASE_URL')
      console.warn('  This helps prevent "connection pool timeout" errors under load.')
    }
    
    // For Neon, Supabase, or other poolers, ensure pgbouncer is enabled
    if ((databaseUrl.includes('neon.tech') || databaseUrl.includes('pooler') || databaseUrl.includes('supabase')) 
        && !databaseUrl.includes('pgbouncer=true')) {
      console.warn('[Prisma] pgbouncer=true not found in DATABASE_URL for pooled connection.')
      console.warn('  Recommended: Add &pgbouncer=true to your DATABASE_URL for better connection pooling.')
    }
    
    prismaConfig.datasources = {
      db: {
        url: databaseUrl,
      },
    }
  }

  return new PrismaClient(prismaConfig)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle connection errors gracefully
prisma.$on('error' as never, (e: any) => {
  console.error('[Prisma] Database error:', {
    message: e?.message || 'Unknown error',
    code: e?.code,
    meta: e?.meta,
    error: e
  })
})

// Retry wrapper for queries that fail due to connection issues
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3, // Increased from 2 to 3 for better reliability
  delay = 1000 // Increased from 500ms to 1000ms for connection pool timeouts
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a connection error
      // Empty error objects {} are often connection issues
      const isEmptyError = !error?.message && !error?.code && Object.keys(error || {}).length === 0
      const isConnectionError = 
        isEmptyError ||
        error?.message?.includes('Closed') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('connection pool') ||
        error?.message?.includes('Timed out fetching') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.code === 'P1001' || // Prisma connection error code
        error?.code === 'P1008' || // Prisma timeout error
        error?.code === 'P1000' || // Authentication failed
        error?.code === 'P2034' || // Transaction failed due to a write conflict or a deadlock
        error?.kind === 'Closed'
      
      if (isConnectionError && attempt < maxRetries) {
        const errorMsg = isEmptyError 
          ? 'Empty error object (likely connection issue)'
          : error?.message || error?.code || 'Unknown connection error'
        console.warn(`[Prisma] Connection error (attempt ${attempt + 1}/${maxRetries + 1}): ${errorMsg}, retrying in ${delay * (attempt + 1)}ms...`)
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)))
        continue
      }
      
      // If not a connection error or max retries reached, throw
      throw error
    }
  }
  
  throw lastError || new Error('Query failed after retries')
}

// Add connection health check helper
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('[Prisma] Connection check failed:', error)
    // Try to reconnect
    try {
      await prisma.$disconnect()
      await prisma.$connect()
      return true
    } catch (reconnectError) {
      console.error('[Prisma] Reconnection failed:', reconnectError)
      return false
    }
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
  
  process.on('SIGINT', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
  
  process.on('SIGTERM', async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

export default prisma

