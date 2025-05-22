import { create } from 'zustand'
import type { Course } from '../types/course'

interface CartItem {
  course: Course
  quantity: number
}

interface CartState {
  items: CartItem[]
  isLoading: boolean
  error: string | null
  addToCart: (course: Course) => void
  removeFromCart: (courseId: string) => void
  updateQuantity: (courseId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  addToCart: (course) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.course.id === course.id)
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.course.id === course.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        }
      }
      return {
        items: [...state.items, { course, quantity: 1 }],
      }
    })
  },

  removeFromCart: (courseId) => {
    set((state) => ({
      items: state.items.filter((item) => item.course.id !== courseId),
    }))
  },

  updateQuantity: (courseId, quantity) => {
    if (quantity < 1) return
    set((state) => ({
      items: state.items.map((item) =>
        item.course.id === courseId ? { ...item, quantity } : item
      ),
    }))
  },

  clearCart: () => {
    set({ items: [] })
  },

  getTotal: () => {
    const state = get()
    return state.items.reduce(
      (total, item) => total + item.course.price * item.quantity,
      0
    )
  },
})) 