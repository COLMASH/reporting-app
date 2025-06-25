import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/routes'

export async function middleware(request: NextRequest) {
    const session = await auth()
    const isOnDashboard = request.nextUrl.pathname.startsWith(ROUTES.DASHBOARD)

    if (isOnDashboard && !session?.user) {
        return NextResponse.redirect(new URL(ROUTES.HOME, request.url))
    }

    return NextResponse.next()
}

// Note: Next.js doesn't support dynamic values in middleware config
// so we must hardcode the path here instead of using ROUTES.DASHBOARD
export const config = {
    matcher: ['/dashboard/:path*']
}
