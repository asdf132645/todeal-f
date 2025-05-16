import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.todeal.app',
    appName: 'todeal',
    webDir: 'dist',
    android: {
        allowMixedContent: true
    },
    server: {
        cleartext: true
    }
}

export default config
