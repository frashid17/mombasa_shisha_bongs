import prisma from '../src/lib/prisma'

async function main() {
  console.log('Starting cleanup of all product images...')

  try {
    const result = await prisma.productImage.deleteMany({})
    console.log(`Deleted ${result.count} product image record(s).`)
  } catch (error) {
    console.error('Error deleting product images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})


