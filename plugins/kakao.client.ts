// plugins/kakao.ts
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin(() => {
    if (typeof window === 'undefined') return

    const waitForKakao = async () => {
        return new Promise<void>((resolve) => {
            const check = () => {
                if (window.Kakao && typeof window.Kakao.init === 'function') {
                    if (!window.Kakao.isInitialized?.()) {
                        window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY)
                        console.log('[✅] Kakao SDK Initialized')
                    }
                    resolve()
                } else {
                    setTimeout(check, 100)
                }
            }
            check()
        })
    }

    return {
        provide: {
            kakaoReady: waitForKakao()
        }
    }
})
