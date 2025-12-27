import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type BundleCartItem = {
  id: string // Bundle ID
  productId: string // Product ID (for bundle items)
  colorId?: string | null
  specId?: string | null
  quantity: number // Quantity of this product in the bundle
}

type CartItem = {
  id: string // Product ID or Bundle ID
  cartItemId?: string // Unique identifier for this cart item (product + color + spec) or bundle ID
  name: string
  price: number // Price per unit (for bundles, this is the bundle price)
  image?: string
  quantity: number
  colorId?: string | null
  colorName?: string | null
  colorValue?: string | null
  specId?: string | null
  specType?: string | null
  specName?: string | null
  specValue?: string | null
  // Bundle-specific fields
  isBundle?: boolean
  bundleId?: string
  bundleItems?: BundleCartItem[] // Products in the bundle with their selections
  bundleDiscount?: number // Discount amount for the bundle
}

// Helper function to generate unique cart item ID
function generateCartItemId(productId: string, colorId?: string | null, specId?: string | null): string {
  const parts = [productId]
  if (colorId) parts.push(`color:${colorId}`)
  if (specId) parts.push(`spec:${specId}`)
  return parts.join('|')
}

type CartStore = {
  items: CartItem[]
  savedItems: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity' | 'cartItemId'>) => void
  addBundle: (bundle: {
    bundleId: string
    name: string
    price: number
    image?: string
    bundleItems: BundleCartItem[]
    bundleDiscount?: number
  }) => void
  removeItem: (cartItemId: string) => void
  saveForLater: (cartItemId: string) => void
  moveToCart: (cartItemId: string) => void
  removeSavedItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  clearSaved: () => void
  getTotal: () => number
  getItemCount: () => number
}

// Helper function to migrate items (for backward compatibility)
function migrateItems(items: CartItem[]): CartItem[] {
  return items.map(item => {
    if (!item.cartItemId) {
      return {
        ...item,
        cartItemId: generateCartItemId(item.id, item.colorId, item.specId)
      }
    }
    return item
  })
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      addItem: (item) => {
        const cartItemId = generateCartItemId(item.id, item.colorId, item.specId)
        // Ensure all items have cartItemId for comparison
        const itemsWithIds = get().items.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        const existing = itemsWithIds.find((i) => i.cartItemId === cartItemId)
        
        if (existing) {
          set({
            items: itemsWithIds.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...itemsWithIds, { ...item, cartItemId, quantity: 1 }] })
        }
      },
      removeItem: (cartItemId) => {
        const items = get().items.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        set({ items: items.filter((i) => i.cartItemId !== cartItemId) })
      },
      saveForLater: async (cartItemId) => {
        const items = get().items.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        const item = items.find((i) => i.cartItemId === cartItemId)
        if (!item) return

        const savedItems = get().savedItems.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        const alreadySaved = savedItems.find((i) => i.cartItemId === cartItemId)
        
        // Update local state immediately
        set({
          items: items.filter((i) => i.cartItemId !== cartItemId),
          savedItems: alreadySaved
            ? savedItems
            : [...savedItems, { ...item }],
        })

        // Sync with database (fire and forget)
        try {
          await fetch('/api/saved-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: item.id, quantity: item.quantity }),
          })
        } catch (error) {
          console.error('Failed to sync saved item:', error)
        }
      },
      moveToCart: (cartItemId) => {
        const savedItems = get().savedItems.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        const item = savedItems.find((i) => i.cartItemId === cartItemId)
        if (!item) return

        const items = get().items.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        const existingInCart = items.find((i) => i.cartItemId === cartItemId)
        set({
          savedItems: savedItems.filter((i) => i.cartItemId !== cartItemId),
          items: existingInCart
            ? items.map((i) =>
                i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + item.quantity } : i
              )
            : [...items, { ...item }],
        })
      },
      removeSavedItem: async (cartItemId) => {
        const savedItems = get().savedItems.map(i => ({
          ...i,
          cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
        }))
        const item = savedItems.find((i) => i.cartItemId === cartItemId)
        
        // Update local state immediately
        set({ savedItems: savedItems.filter((i) => i.cartItemId !== cartItemId) })

        // Sync with database (fire and forget)
        if (item) {
          try {
            await fetch(`/api/saved-items?productId=${item.id}`, {
              method: 'DELETE',
            })
          } catch (error) {
            console.error('Failed to remove saved item:', error)
          }
        }
      },
      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
        } else {
          const items = get().items.map(i => ({
            ...i,
            cartItemId: i.cartItemId || generateCartItemId(i.id, i.colorId, i.specId)
          }))
          set({
            items: items.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity } : i)),
          })
        }
      },
      addBundle: (bundle) => {
        const cartItemId = `bundle:${bundle.bundleId}`
        const itemsWithIds = get().items.map(i => ({
          ...i,
          cartItemId: i.cartItemId || (i.isBundle ? `bundle:${i.bundleId}` : generateCartItemId(i.id, i.colorId, i.specId))
        }))
        const existing = itemsWithIds.find((i) => i.cartItemId === cartItemId)
        
        if (existing) {
          set({
            items: itemsWithIds.map((i) =>
              i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({
            items: [
              ...itemsWithIds,
              {
                id: bundle.bundleId,
                cartItemId,
                name: bundle.name,
                price: bundle.price, // Bundle price (already discounted)
                image: bundle.image,
                quantity: 1,
                isBundle: true,
                bundleId: bundle.bundleId,
                bundleItems: bundle.bundleItems,
                bundleDiscount: bundle.bundleDiscount,
              },
            ],
          })
        }
      },
      clearCart: () => set({ items: [] }),
      clearSaved: () => set({ savedItems: [] }),
      getTotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    { 
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, savedItems: state.savedItems }),
      onRehydrateStorage: () => (state) => {
        // Migrate old cart items to have cartItemId when rehydrating
        if (state) {
          const migratedItems = migrateItems(state.items)
          const migratedSavedItems = migrateItems(state.savedItems)
          if (migratedItems.length !== state.items.length || 
              migratedSavedItems.length !== state.savedItems.length ||
              migratedItems.some((item, i) => item.cartItemId !== state.items[i]?.cartItemId)) {
            state.items = migratedItems
            state.savedItems = migratedSavedItems
          }
        }
      }
    }
  )
)

