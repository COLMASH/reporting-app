import { z } from 'zod'

export interface User {
    id: string
    email: string
    name: string | null
    image: string | null
    company_name: string | null
    role: 'user' | 'admin'
    is_active: boolean
    created_at: string
}

export interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
}

export interface JWTPayload {
    sub: string
    id: string
    email: string
    name: string | null
    image: string | null
    exp: number
    iat: number
}

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')
})

export type LoginFormData = z.infer<typeof loginSchema>

export interface LoginResponse {
    user: User
    token: TokenResponse
}

export interface AuthError {
    message: string
    status?: number
}
