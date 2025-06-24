import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { AuthService } from '@/lib/auth-service'
import { loginSchema } from '@/types/auth'

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                try {
                    const parsedCredentials = loginSchema.safeParse(credentials)

                    if (!parsedCredentials.success) {
                        return null
                    }

                    const tokenResponse = await AuthService.login(parsedCredentials.data)
                    const user = await AuthService.getUserInfo(tokenResponse.access_token)

                    return {
                        ...user,
                        accessToken: tokenResponse.access_token,
                        tokenExpiry: Date.now() + tokenResponse.expires_in * 1000
                    }
                } catch {
                    return null
                }
            }
        })
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 60 // 30 minutes to match backend
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Initial sign in
                return {
                    ...token,
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    company_name: user.company_name,
                    role: user.role,
                    is_active: user.is_active,
                    accessToken: user.accessToken,
                    tokenExpiry: user.tokenExpiry
                }
            }

            // Return previous token if the access token has not expired yet
            if (Date.now() < (token.tokenExpiry as number)) {
                return token
            }

            // Access token has expired, try to verify it with backend
            try {
                const user = await AuthService.verifyToken(token.accessToken as string)
                return {
                    ...token,
                    ...user
                }
            } catch {
                // Token is invalid, force sign out
                return { ...token, error: 'RefreshAccessTokenError' }
            }
        },
        async session({ session, token }) {
            if (token.error) {
                // Force sign out on token error
                return {
                    ...session,
                    error: token.error
                }
            }

            // @ts-expect-error NextAuth types expect AdapterUser
            session.user = {
                id: token.id as string,
                email: token.email as string,
                name: token.name as string | null,
                image: token.image as string | null,
                company_name: token.company_name as string | null,
                role: token.role as 'user' | 'admin',
                is_active: token.is_active as boolean,
                created_at: new Date().toISOString()
            }

            return session
        }
    },
    pages: {
        signIn: '/',
        error: '/'
    },
    debug: process.env.NODE_ENV === 'development'
})
