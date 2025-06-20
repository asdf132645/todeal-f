//  stores/searchStore.ts
import { defineStore } from 'pinia'

export const useSearchStore = defineStore('search', {
    state: () => ({
        recentSearches: [] as any[]
    }),
    actions: {
        addRecentSearch(search: any) {
            const exists = this.recentSearches.find(s => JSON.stringify(s) === JSON.stringify(search))
            if (!exists) this.recentSearches.unshift(search)
            if (this.recentSearches.length > 10) this.recentSearches.pop()
        }
    }
})
