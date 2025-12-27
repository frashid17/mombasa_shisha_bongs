import prisma from '@/lib/prisma'
import ConditionalFooter from './ConditionalFooter'

async function getCategories() {
  return prisma.category.findMany({
    take: 6,
    orderBy: { name: 'asc' },
  })
}

export default async function Footer() {
  const categories = await getCategories()
  
  return <ConditionalFooter categories={categories} />
}
