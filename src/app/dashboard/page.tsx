import { auth } from '@/auth'
import { FilesDashboard } from '@/features/files/components/files-dashboard'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { UserAvatar } from '@/features/auth/components/user-avatar'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        return null
    }

    return (
        <div className="bg-background min-h-screen">
            <header className="border-border bg-card border-b">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-14 items-center justify-between sm:h-16">
                        <h1 className="text-lg font-semibold sm:text-xl">Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <ThemeToggle />
                            <UserAvatar user={session.user} />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <FilesDashboard />
            </main>
        </div>
    )
}
