/**
 * Whether the product should be treated as unavailable for purchase on the storefront.
 * Admin "sold out" overrides even when stock is positive.
 */
export function isProductUnavailableForPurchase(product: {
  isSoldOut?: boolean | null
  stock: number
}): boolean {
  return Boolean(product.isSoldOut) || product.stock <= 0
}

/** Label for storefront UI when the item cannot be purchased */
export function getUnavailablePurchaseLabel(product: {
  isSoldOut?: boolean | null
  stock: number
}): 'Sold out' | 'Out of stock' | null {
  if (!isProductUnavailableForPurchase(product)) return null
  return product.isSoldOut ? 'Sold out' : 'Out of stock'
}
