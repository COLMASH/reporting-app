import { auth } from '@/auth'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const session = await auth()
    const isOnDashboard = request.nextUrl.pathname.startsWith('/dashboard')

    if (isOnDashboard && !session?.user) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*']
}
