// ~/composables/useFcm.ts
import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import axios from 'axios'

export const useFcm = () => {
    const registerFcm = async (userId: number) => {
        if (!Capacitor.isNativePlatform()) {
            console.log('📱 푸시는 네이티브 앱에서만 동작')
            return
        }

        await PushNotifications.requestPermissions()
        await PushNotifications.register()

        PushNotifications.addListener('registration', async (token) => {
            console.log('✅ FCM 등록 토큰:', token.value)

            try {
                await axios.patch(
                    `/api/users/me/fcm-token`,
                    { fcmToken: token.value },
                    { headers: { 'X-USER-ID': userId } }
                )
                console.log('🛰️ 서버에 FCM 토큰 등록 완료')
            } catch (err) {
                console.error('❌ FCM 토큰 서버 등록 실패', err)
            }
        })

        PushNotifications.addListener('registrationError', (error) => {
            console.error('❌ FCM 등록 실패:', error)
        })
    }

    return { registerFcm }
}
