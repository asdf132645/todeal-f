import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'com.todeal.app',
    appName: 'toDEAL',
    webDir: '.output/public',
    android: {
        allowMixedContent: false, // 가능하면 false
        webContentsDebuggingEnabled: true // 개발 중일 땐 true
    },
    server: {
        url: 'https://app.to-deal.com',
        cleartext: false
    },
    bundledWebRuntime: false
}

export default config
