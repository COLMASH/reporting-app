import { LoginFormData, TokenResponse, User } from '@/features/auth/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

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
            throw new Error(error.detail || 'Invalid credentials')
        }

        const data: TokenResponse = await response.json()
        return data
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
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
            throw new Error('Failed to fetch user info')
        }

        const user: User = await response.json()
        return user
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
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
            throw new Error('Invalid token')
        }

        const user: User = await response.json()
        return user
    } catch (error) {
        if (error instanceof Error) {
            throw error
        }
        throw new Error('Token verification failed')
    }
}
