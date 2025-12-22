import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  colorId?: string | null
  colorName?: string | null
  colorValue?: string | null
  specId?: string | null
  specType?: string | null
  specName?: string | null
  specValue?: string | null
}

type CartStore = {
  items: CartItem[]
  savedItems: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  saveForLater: (id: string) => void
  moveToCart: (id: string) => void
  removeSavedItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  clearSaved: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      savedItems: [],
      addItem: (item) => {
        // For products with colors or specs, treat them as part of the unique identifier
        const itemKey = item.colorId || item.specId 
          ? `${item.id}-${item.colorId || ''}-${item.specId || ''}` 
          : item.id
        const existing = get().items.find((i) => {
          const existingKey = i.colorId || i.specId 
            ? `${i.id}-${i.colorId || ''}-${i.specId || ''}` 
            : i.id
          return existingKey === itemKey
        })
        if (existing) {
          set({
            items: get().items.map((i) => {
              const existingKey = i.colorId || i.specId 
                ? `${i.id}-${i.colorId || ''}-${i.specId || ''}` 
                : i.id
              return existingKey === itemKey ? { ...i, quantity: i.quantity + 1 } : i
            }),
          })
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      saveForLater: (id) => {
        const item = get().items.find((i) => i.id === id)
        if (!item) return

        const alreadySaved = get().savedItems.find((i) => i.id === id)
        set({
          items: get().items.filter((i) => i.id !== id),
          savedItems: alreadySaved
            ? get().savedItems
            : [...get().savedItems, { ...item }],
        })
      },
      moveToCart: (id) => {
        const item = get().savedItems.find((i) => i.id === id)
        if (!item) return

        const existingInCart = get().items.find((i) => i.id === id)
        set({
          savedItems: get().savedItems.filter((i) => i.id !== id),
          items: existingInCart
            ? get().items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              )
            : [...get().items, { ...item }],
        })
      },
      removeSavedItem: (id) => {
        set({ savedItems: get().savedItems.filter((i) => i.id !== id) })
      },
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: get().items.map((i) => (i.id === id ? { ...i, quantity } : i)),
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
    { name: 'cart-storage' }
  )
)

