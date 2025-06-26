import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/routes'

export async function middleware(request: NextRequest) {
    try {
        const session = await auth()
        const isOnDashboard = request.nextUrl.pathname.startsWith(ROUTES.DASHBOARD)

        if (isOnDashboard && !session?.user) {
            return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
        }

        return NextResponse.next()
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Middleware auth error:', error)

        // On auth check failure, redirect to home page as a safety measure
        const isOnDashboard = request.nextUrl.pathname.startsWith(ROUTES.DASHBOARD)
        if (isOnDashboard) {
            return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
        }

        return NextResponse.next()
    }
}

// Note: Next.js doesn't support dynamic values in middleware config
// so we must hardcode the path here instead of using ROUTES.DASHBOARD
export const config = {
    matcher: ['/dashboard/:path*']
}
