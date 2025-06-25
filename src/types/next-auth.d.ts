import { User as AppUser } from '@/features/auth/types'

declare module 'next-auth' {
    interface Session {
        user: AppUser
        error?: string
    }

    interface User extends AppUser {
        accessToken?: string
        tokenExpiry?: number
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        email: string
        name: string | null
        image: string | null
        company_name: string | null
        role: 'user' | 'admin'
        is_active: boolean
        accessToken: string
        tokenExpiry: number
        error?: string
    }
}
