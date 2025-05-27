// ~/stores/themeStore.ts
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
    state: () => ({
        isDark: true, // 기본 테마
    }),
    actions: {
        initTheme() {
            const saved = localStorage.getItem('todeal-theme')
            this.isDark = saved === null ? true : saved === 'dark'
            document.body.classList.toggle('light-mode', !this.isDark)
        },
        toggleTheme() {
            this.isDark = !this.isDark
            localStorage.setItem('todeal-theme', this.isDark ? 'dark' : 'light')
            document.body.classList.toggle('light-mode', !this.isDark)
        },
    }
})
