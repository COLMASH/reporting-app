'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { ROUTES } from '@/routes'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    const router = useRouter()

    const handleLogout = async () => {
        try {
            await signOut({ redirect: true, callbackUrl: ROUTES.HOME })
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Logout error:', error)
            router.push(ROUTES.HOME)
        }
    }

    return (
        <Button onClick={handleLogout} variant="outline" size="sm" className="text-xs sm:text-sm">
            Sign out
        </Button>
    )
}
