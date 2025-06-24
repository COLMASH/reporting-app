'use client'

import { signOut } from 'next-auth/react'

export function LogoutButton() {
    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: '/' })
    }

    return (
        <button
            onClick={handleLogout}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
        >
            Sign out
        </button>
    )
}
