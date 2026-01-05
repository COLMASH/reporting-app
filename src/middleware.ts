import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/routes'

/**
 * Check if the current path is a protected route
 */
const isProtectedRoute = (pathname: string): boolean => {
    return (
        pathname.startsWith(ROUTES.DASHBOARD) ||
        pathname.startsWith(ROUTES.PORTFOLIO_DASHBOARDS) ||
        pathname.startsWith(ROUTES.PORTFOLIO_REPORTS)
    )
}

export async function middleware(request: NextRequest) {
    try {
        const session = await auth()
        const isProtected = isProtectedRoute(request.nextUrl.pathname)

        if (!isProtected) {
            return NextResponse.next()
        }

        // Check if user is not authenticated
        if (!session?.user) {
            return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
        }

        // Check if token has expired (session.error is set by auth.ts jwt callback)
        if (session.error === 'RefreshAccessTokenError') {
            // Clear the session cookie and redirect to login
            const response = NextResponse.redirect(new URL(ROUTES.HOME, request.url))
            // Delete the session cookie to force re-authentication
            response.cookies.delete('authjs.session-token')
            response.cookies.delete('__Secure-authjs.session-token')
            return response
        }

        return NextResponse.next()
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Middleware auth error:', error)

        // On auth check failure, redirect to home page as a safety measure
        if (isProtectedRoute(request.nextUrl.pathname)) {
            return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
        }

        return NextResponse.next()
    }
}

// Note: Next.js doesn't support dynamic values in middleware config
// so we must hardcode the paths here instead of using ROUTES constants
export const config = {
    matcher: ['/dashboard/:path*', '/dashboards/:path*', '/portfolio-reports/:path*']
}
