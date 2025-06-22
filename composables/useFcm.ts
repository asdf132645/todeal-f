import { PushNotifications } from '@capacitor/push-notifications'
import { Capacitor } from '@capacitor/core'
import axios from 'axios'

let isRegistered = false //  리스너 중복 방지용

export const useFcm = () => {
    const registerFcm = async (userId: number) => {
        if (!Capacitor.isNativePlatform()) {
            alert('📱 푸시는 네이티브 앱에서만 동작')
            return
        }

        await PushNotifications.requestPermissions()
        await PushNotifications.register()

        if (isRegistered) return
        isRegistered = true

        PushNotifications.addListener('registration', async (token) => {
            alert(' FCM 등록 토큰:', token.value)

            try {
                await axios.patch(
                    '/api/users/me/fcm-token',
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

    const unregisterFcm = async (userId?: number) => {
        if (!Capacitor.isNativePlatform()) return

        try {
            await axios.delete('/api/users/me/fcm-token', {
                headers: { 'X-USER-ID': userId ?? 0 }
            })
            console.log('🔌 서버 FCM 토큰 삭제 완료')
        } catch (err) {
            console.error('❌ 서버 FCM 토큰 삭제 실패', err)
        }

        try {
            await PushNotifications.removeAllListeners()
            await PushNotifications.unregister() //  명확히 unregister 호출
            isRegistered = false
            console.log('🔕 FCM 리스너 제거 완료')
        } catch (err) {
            console.error('❌ FCM 리스너 제거 실패', err)
        }
    }

    return { registerFcm, unregisterFcm }
}
