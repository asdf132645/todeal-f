// plugins/vuetify.ts
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { defineNuxtPlugin } from '#app'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

import 'vuetify/styles'
import { ko } from 'vuetify/locale'

export default defineNuxtPlugin((nuxtApp) => {
    const vuetify = createVuetify({
        components,
        directives,
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: { mdi },
        },
        locale: {
            locale: 'ko',
            messages: { ko },
        },
        theme: {
            defaultTheme: 'dark',
            themes: {
                light: {
                    // dark: false,
                    // colors: {
                    //     background: '#F9FAFB',
                    //     surface: '#FFFFFF',
                    //     primary: '#2A2E9D',
                    //     secondary: '#FEDA3C',
                    //     error: '#B00020',
                    //     info: '#2196F3',
                    //     success: '#4CAF50',
                    //     warning: '#FB8C00',
                    // },
                },
                dark: {
                    colors: {
                        primary: '#FFD54F',
                        onPrimary: '#000', // primary 버튼 안의 글자색
                    },
                    // dark: true,
                    // colors: {
                    //     background: '#121212',
                    //     surface: '#1E1E1E',
                    //     primary: '#8C9EFF',
                    //     secondary: '#FFD54F',
                    //     error: '#CF6679',
                    //     info: '#64B5F6',
                    //     success: '#81C784',
                    //     warning: '#FFB74D',
                    // },
                },
            },
        }
    })

    nuxtApp.vueApp.use(vuetify)
})