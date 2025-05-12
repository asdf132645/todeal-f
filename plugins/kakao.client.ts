export default defineNuxtPlugin(() => {
    const key = import.meta.env.VITE_KAKAO_JS_KEY
    if (typeof window !== 'undefined' && window.Kakao && !window.Kakao.isInitialized?.()) {
        window.Kakao.init(key)
        console.log('[✅] Kakao SDK Initialized')
    }
})
