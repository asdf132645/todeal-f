// stores/snackbarStore.ts
import { defineStore } from 'pinia'

export const useSnackbarStore = defineStore('snackbar', {
    state: () => ({
        visible: false,
        text: '',
        color: 'info' as 'success' | 'error' | 'info',
    }),
    actions: {
        show(text: string, color: 'success' | 'error' | 'info' = 'info') {
            this.text = text
            this.color = color
            this.visible = true
        },
        hide() {
            this.visible = false
        },
    },
})
