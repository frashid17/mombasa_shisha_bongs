import ProductForm from '@/components/admin/products/ProductForm'
import prisma from '@/lib/prisma'

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

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const { product, categories } = await getData(params.id)

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-gray-600 mt-1">Update product information</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}

