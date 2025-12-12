import { getCartRecommendations } from '@/lib/recommendations'
import ProductRecommendations from '@/components/products/ProductRecommendations'

export default async function CartRecommendations({ cartItemIds }: { cartItemIds: string[] }) {
  const recommendations = await getCartRecommendations(cartItemIds)
  return <ProductRecommendations products={recommendations} />
}

