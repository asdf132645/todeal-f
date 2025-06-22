import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.todeal.app',
    appName: 'toDEAL',
    webDir: '.output/public',
    android: {
        allowMixedContent: false,
        webContentsDebuggingEnabled: true
    },
    server: {
        url: 'https://app.to-deal.com',
        cleartext: false,
        androidScheme: 'https'
    },
    plugins: {
        Geolocation: {
            enabled: true
        }
    }
}

export default config
