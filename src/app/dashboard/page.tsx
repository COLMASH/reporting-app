import { auth } from '@/auth'
import { FilesDashboard } from '@/features/files/components/files-dashboard'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { UserAvatar } from '@/features/auth/components/user-avatar'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ROUTES } from '@/routes'
import { FileText, TrendingUp, ArrowRight } from 'lucide-react'

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
                <div className="mb-8 grid gap-4 md:grid-cols-2">
                    <Card className="transition-shadow hover:shadow-lg">
                        <Link href={ROUTES.DASHBOARD} className="block">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="text-primary h-8 w-8" />
                                        <div>
                                            <CardTitle>Files & Documents</CardTitle>
                                            <CardDescription>
                                                Manage your uploaded files and analyses
                                            </CardDescription>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                        </Link>
                    </Card>

                    <Card className="transition-shadow hover:shadow-lg">
                        <Link href={ROUTES.PORTFOLIO_DASHBOARDS} className="block">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <TrendingUp className="text-primary h-8 w-8" />
                                        <div>
                                            <CardTitle>Portfolio Dashboards</CardTitle>
                                            <CardDescription>
                                                View portfolio overview and asset analytics
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-muted-foreground h-5 w-5" />
                                </div>
                            </CardHeader>
                        </Link>
                    </Card>
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-semibold">Files & Documents</h2>
                    <FilesDashboard />
                </div>
            </main>
        </div>
    )
}
