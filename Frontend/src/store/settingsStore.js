import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** Resolve 'system' against the OS preference; 'dark'/'light' pass through unchanged. */
export const resolveTheme = (theme) => {
  if (theme !== 'system') return theme
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

/** Stamp the resolved theme onto <html data-theme="..."> so tokens.css can react to it. */
export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = resolveTheme(theme)
}

/** Stamp text size onto <html data-text-size="..."> — scales the root rem base. */
export const applyTextSize = (textSize) => {
  document.documentElement.dataset.textSize = textSize
}

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'dark', // 'dark' | 'light' | 'system'
      textSize: 'medium', // 'small' | 'medium' | 'large'
      groqApiKey: '',

      setTheme: (theme) => {
        applyTheme(theme)
        set({ theme })
      },
      setTextSize: (textSize) => {
        applyTextSize(textSize)
        set({ textSize })
      },
      setGroqApiKey: (groqApiKey) => set({ groqApiKey: groqApiKey.trim() }),
    }),
    {
      name: 'vcet-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
          applyTextSize(state.textSize)
        }
      },
    }
  )
)
