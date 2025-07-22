import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { login, getUserInfo, verifyToken } from '@/features/auth/services/auth'
import { loginSchema } from '@/features/auth/types'
import { ROUTES } from '@/routes'

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
                        // eslint-disable-next-line no-console
                        console.warn(
                            'Invalid login credentials format:',
                            parsedCredentials.error.flatten()
                        )
                        return null
                    }

                    const tokenResponse = await login(parsedCredentials.data)
                    const user = await getUserInfo(tokenResponse.access_token)

                    return {
                        ...user,
                        accessToken: tokenResponse.access_token,
                        tokenExpiry: Date.now() + tokenResponse.expires_in * 1000
                    }
                } catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('NextAuth authorize error:', error)
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
                const user = await verifyToken(token.accessToken as string)
                return {
                    ...token,
                    ...user
                }
            } catch (error) {
                // Token is invalid, force sign out
                // eslint-disable-next-line no-console
                console.warn('Token refresh failed:', error)
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

            // Include accessToken in session for API calls
            session.accessToken = token.accessToken as string

            return session
        }
    },
    pages: {
        signIn: ROUTES.HOME,
        error: ROUTES.HOME
    },
    debug: process.env.NODE_ENV === 'development'
})
