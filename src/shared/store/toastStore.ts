import { defineStore } from 'pinia'
import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error'
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function addToast(message: string, type: 'success' | 'error' = 'success') {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 3000)
  }

  function removeToast(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, addToast, removeToast }
})
