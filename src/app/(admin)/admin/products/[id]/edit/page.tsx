import ProductForm from '@/components/admin/products/ProductForm'
import prisma from '@/lib/prisma'
import { serializeProduct } from '@/lib/prisma-serialize'

async function getData(id: string) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true, images: true },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])
  return { product, categories }
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { product, categories } = await getData(id)

  if (!product) {
    return <div>Product not found</div>
  }

  // Serialize product to convert Decimal objects to numbers
  const serializedProduct = serializeProduct(product)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-700 mt-1">Update product information</p>
      </div>
      <ProductForm categories={categories} product={serializedProduct} />
    </div>
  )
}

