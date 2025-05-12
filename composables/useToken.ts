const ACCESS_KEY = 'accessToken'
const REFRESH_KEY = 'refreshToken'

export function getStoredAccessToken(): string | null {
    if (!process.client) return null
    const token = sessionStorage.getItem(ACCESS_KEY)
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        return null
    }
    return token
}

export function getStoredRefreshToken(): string | null {
    if (!process.client) return null
    const token = localStorage.getItem(REFRESH_KEY)
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
        return null
    }
    return token
}

export function saveAccessToken(token: string) {
    if (process.client) {
        sessionStorage.setItem(ACCESS_KEY, token)
    }
}

export function saveRefreshToken(token: string) {
    if (process.client) {
        localStorage.setItem(REFRESH_KEY, token)
    }
}

export function clearStoredTokens() {
    if (process.client) {
        sessionStorage.removeItem(ACCESS_KEY)
        localStorage.removeItem(REFRESH_KEY)
    }
}
