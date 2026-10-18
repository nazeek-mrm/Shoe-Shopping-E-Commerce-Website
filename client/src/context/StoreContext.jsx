import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'

const StoreContext = createContext(null)
export const useStore = () => useContext(StoreContext)

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}

export function StoreProvider({ children }) {
  const [cart, setCart]         = useState(() => load('shoemart_cart', []))
  const [compare, setCompare]   = useState(() => load('shoemart_compare', []))
  const [wishlist, setWishlist] = useState(() => load('shoemart_wishlist', []))
  const [toasts, setToasts]     = useState([])

  useEffect(() => { localStorage.setItem('shoemart_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('shoemart_compare', JSON.stringify(compare)) }, [compare])
  useEffect(() => { localStorage.setItem('shoemart_wishlist', JSON.stringify(wishlist)) }, [wishlist])

  const toast = useCallback((message, kind = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((items) => {
      const found = items.find((i) => i.id === product.id)
      if (found) {
        return items.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...items, {
        id: product.id,
        model: `${product.brand} ${product.model}`,
        price: product.price,
        image: product.images?.[0] || '',
        stock: product.stock,
        quantity,
      }]
    })
    toast(`${product.brand} ${product.model} added to cart.`)
  }, [toast])

  const setQuantity = (id, quantity) =>
    setCart((items) => items.map((i) =>
      i.id === id ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i
    ))

  const removeFromCart = (id) => setCart((items) => items.filter((i) => i.id !== id))
  const clearCart = () => setCart([])

  const toggleCompare = (product) => {
    setCompare((items) => {
      if (items.some((i) => i.id === product.id)) return items.filter((i) => i.id !== product.id)
      if (items.length >= 3) { toast('Compare holds three shoes. Remove one first.', 'err'); return items }
      return [...items, { id: product.id, model: `${product.brand} ${product.model}` }]
    })
  }
  const clearCompare = () => setCompare([])

  const toggleWish = (product) => {
    setWishlist((items) => {
      if (items.some((i) => i.id === product.id)) {
        toast('Removed from saved shoes.')
        return items.filter((i) => i.id !== product.id)
      }
      toast('Saved. Find it under Saved in the menu.')
      return [...items, { id: product.id, model: `${product.brand} ${product.model}` }]
    })
  }

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.quantity, 0), [cart])
  const cartTotal = useMemo(() => cart.reduce((n, i) => n + i.price * i.quantity, 0), [cart])

  const value = {
    cart, cartCount, cartTotal, addToCart, setQuantity, removeFromCart, clearCart,
    compare, toggleCompare, clearCompare,
    wishlist, toggleWish,
    toast, toasts,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
