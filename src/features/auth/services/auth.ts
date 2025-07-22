import { LoginFormData, TokenResponse, User } from '@/features/auth/types'
import { getApiUrl } from '@/lib/utils/api-url'

const API_URL = getApiUrl()

export async function login(credentials: LoginFormData): Promise<TokenResponse> {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        })

        if (!response.ok) {
            const error = await response.json()
            // eslint-disable-next-line no-console
            console.warn('Login failed:', {
                status: response.status,
                statusText: response.statusText,
                error: error.detail || 'Invalid credentials',
                endpoint: `${API_URL}/api/v1/auth/login`
            })
            throw new Error(error.detail || 'Invalid credentials')
        }

        const data: TokenResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            // Only log if it's not a login failure (which we already logged)
            if (!error.message.includes('Invalid credentials')) {
                // eslint-disable-next-line no-console
                console.error('Login error:', error)
            }
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected login error:', error)
        throw new Error('An unexpected error occurred')
    }
}

export async function getUserInfo(token: string): Promise<User> {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            // eslint-disable-next-line no-console
            console.error('Failed to fetch user info:', {
                status: response.status,
                statusText: response.statusText,
                endpoint: `${API_URL}/api/v1/auth/me`
            })
            throw new Error('Failed to fetch user info')
        }

        const user: User = await response.json()
        return user
    } catch (error) {
        if (error instanceof Error) {
            // Only log if we haven't already logged it
            if (!error.message.includes('Failed to fetch user info')) {
                // eslint-disable-next-line no-console
                console.error('getUserInfo error:', error)
            }
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected getUserInfo error:', error)
        throw new Error('Failed to fetch user info')
    }
}

export async function verifyToken(token: string): Promise<User> {
    try {
        const response = await fetch(`${API_URL}/api/v1/auth/verify`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            // eslint-disable-next-line no-console
            console.warn('Token verification failed:', {
                status: response.status,
                statusText: response.statusText,
                endpoint: `${API_URL}/api/v1/auth/verify`
            })
            throw new Error('Invalid token')
        }

        const user: User = await response.json()
        return user
    } catch (error) {
        if (error instanceof Error) {
            // Only log if we haven't already logged it
            if (!error.message.includes('Invalid token')) {
                // eslint-disable-next-line no-console
                console.error('verifyToken error:', error)
            }
            throw error
        }
        // eslint-disable-next-line no-console
        console.error('Unexpected verifyToken error:', error)
        throw new Error('Token verification failed')
    }
}
