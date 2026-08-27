import { create } from 'zustand'

let nextId = 0

export const useToastStore = create((set, get) => ({
  toasts: [], // [{id, message, type}]

  /** @param {string} message @param {'info'|'success'|'error'} type */
  push: (message, type = 'info') => {
    const id = ++nextId
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => get().dismiss(id), 3200)
    return id
  },
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
