import { auth } from '@/auth'
import { LogoutButton } from '@/features/auth/components/logout-button'
import { StorageDashboard } from '@/features/storage/components/storage-dashboard'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="grid gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg sm:text-xl">
                                Welcome, {session.user.name || session.user.email}!
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                This is your dashboard. Your account details are shown below.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <div>
                                    <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                                        Email
                                    </span>
                                    <p className="mt-1 text-sm break-all sm:text-base">
                                        {session.user.email}
                                    </p>
                                </div>
                                {session.user.name && (
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                                            Name
                                        </span>
                                        <p className="mt-1 text-sm sm:text-base">
                                            {session.user.name}
                                        </p>
                                    </div>
                                )}
                                {session.user.company_name && (
                                    <div>
                                        <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                                            Company
                                        </span>
                                        <p className="mt-1 text-sm sm:text-base">
                                            {session.user.company_name}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                                        Role
                                    </span>
                                    <p className="mt-1 text-sm capitalize sm:text-base">
                                        {session.user.role}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground text-xs font-medium sm:text-sm">
                                        Status
                                    </span>
                                    <p className="mt-1 text-sm sm:text-base">
                                        {session.user.is_active ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <StorageDashboard />
                </div>
            </main>
        </div>
    )
}
