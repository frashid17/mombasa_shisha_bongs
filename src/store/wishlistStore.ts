import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type WishlistItem = {
  id: string
  name: string
  price: number
  image?: string
  slug?: string
}

type WishlistStore = {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  isInWishlist: (id: string) => boolean
  toggleItem: (item: WishlistItem) => void
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (!existing) {
          set({ items: [...get().items, item] })
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },
      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id)
      },
      toggleItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id)
        if (existing) {
          get().removeItem(item.id)
        } else {
          get().addItem(item)
        }
      },
      clearWishlist: () => set({ items: [] }),
      getItemCount: () => {
        return get().items.length
      },
    }),
    { name: 'wishlist-storage' }
  )
)

