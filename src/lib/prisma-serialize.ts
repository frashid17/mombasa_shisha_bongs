/**
 * Prisma Serialization Utilities
 * 
 * Converts Prisma Decimal objects to numbers for Client Components
 * Next.js cannot serialize Decimal objects when passing props from Server to Client Components
 */

import { Decimal } from '@prisma/client/runtime/library'

/**
 * Convert a Prisma Decimal to a number
 */
function decimalToNumber(value: Decimal | null | undefined): number {
  if (!value) return 0
  return Number(value)
}

/**
 * Serialize a product for Client Components
 * Converts all Decimal fields to numbers
 */
export function serializeProduct(product: any) {
  if (!product) return null

  return {
    ...product,
    price: decimalToNumber(product.price),
    compareAtPrice: product.compareAtPrice ? decimalToNumber(product.compareAtPrice) : null,
    costPrice: product.costPrice ? decimalToNumber(product.costPrice) : null,
    weight: product.weight ? decimalToNumber(product.weight) : null,
    length: product.length ? decimalToNumber(product.length) : null,
    width: product.width ? decimalToNumber(product.width) : null,
    height: product.height ? decimalToNumber(product.height) : null,
    // Serialize specifications with price
    specifications: product.specifications ? product.specifications.map((spec: any) => ({
      ...spec,
      price: spec.price ? decimalToNumber(spec.price) : null,
    })) : [],
    // Keep other fields as-is
    images: product.images || [],
    category: product.category || null,
    reviews: product.reviews || [],
  }
}

/**
 * Serialize an array of products
 */
export function serializeProducts(products: any[]) {
  return products.map(serializeProduct)
}

/**
 * Serialize an order item (also has Decimal fields)
 */
export function serializeOrderItem(item: any) {
  if (!item) return null

  return {
    ...item,
    price: decimalToNumber(item.price),
    subtotal: decimalToNumber(item.subtotal),
    // Keep other fields
    product: item.product ? serializeProduct(item.product) : null,
  }
}

/**
 * Serialize a payment (has Decimal fields in amount)
 */
export function serializePayment(payment: any) {
  if (!payment) return null

  return {
    ...payment,
    amount: decimalToNumber(payment.amount),
  }
}

/**
 * Serialize an order (has Decimal fields in total, subtotal, etc.)
 */
export function serializeOrder(order: any) {
  if (!order) return null

  return {
    ...order,
    total: decimalToNumber(order.total),
    subtotal: decimalToNumber(order.subtotal),
    tax: decimalToNumber(order.tax),
    deliveryFee: decimalToNumber(order.deliveryFee),
    discount: decimalToNumber(order.discount),
    items: order.items ? order.items.map(serializeOrderItem) : [],
    payment: order.payment ? serializePayment(order.payment) : null,
  }
}

