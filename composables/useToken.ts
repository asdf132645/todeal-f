const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export function getStoredAccessToken(): string | null {
    if (!process.client) return null
    const token = localStorage.getItem(ACCESS_KEY)  // ✅ 수정됨
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        return null
    }
    return token
}

export function saveAccessToken(token: string) {
    if (process.client) {
        localStorage.setItem(ACCESS_KEY, token) // ✅ 수정됨
    }
}

export function getStoredRefreshToken(): string | null {
    if (!process.client) return null
    const token = localStorage.getItem(REFRESH_KEY)
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        return null
    }
    return token
}

export function saveRefreshToken(token: string) {
    if (process.client) {
        localStorage.setItem(REFRESH_KEY, token)
    }
}

export function clearStoredTokens() {
    if (process.client) {
        localStorage.removeItem(ACCESS_KEY) // ✅ 같이 삭제해야 함
        localStorage.removeItem(REFRESH_KEY)
    }
}
