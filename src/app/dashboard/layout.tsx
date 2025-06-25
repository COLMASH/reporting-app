import { ReactNode } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/routes'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await auth()

    if (!session?.user) {
        redirect(ROUTES.HOME)
    }

    return <>{children}</>
}
