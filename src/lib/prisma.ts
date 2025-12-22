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

  // If using Neon or a connection pooler, ensure the URL has proper parameters
  if (databaseUrl?.includes('neon.tech') || databaseUrl?.includes('pooler')) {
    // Neon connection string should already include pooling parameters
    // But we can ensure proper configuration here
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
  console.error('[Prisma] Database error:', e)
})

// Retry wrapper for queries that fail due to connection issues
export async function withRetry<T>(
  queryFn: () => Promise<T>,
  maxRetries = 2,
  delay = 500
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn()
    } catch (error: any) {
      lastError = error
      
      // Check if it's a connection error
      const isConnectionError = 
        error?.message?.includes('Closed') ||
        error?.message?.includes('connection') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.code === 'P1001' || // Prisma connection error code
        error?.code === 'P1008' || // Prisma timeout error
        error?.kind === 'Closed'
      
      if (isConnectionError && attempt < maxRetries) {
        console.warn(`[Prisma] Connection error (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay * (attempt + 1)}ms...`)
        
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

