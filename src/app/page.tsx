import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from '@/features/auth/components/login-form'
import { ROUTES } from '@/routes'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/common/theme-toggle'

export default async function HomePage() {
    const session = await auth()

    if (session?.user) {
        redirect(ROUTES.PORTFOLIO_DASHBOARDS)
    }

    return (
        <div className="bg-background flex min-h-screen flex-col">
            <div className="flex justify-end p-4 sm:p-6">
                <ThemeToggle />
            </div>
            <div className="flex flex-1 items-center justify-center px-4 pb-8 sm:px-6 lg:px-8">
                <Card className="w-full max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-center text-xl font-bold sm:text-2xl">
                            Sign in
                        </CardTitle>
                        <CardDescription className="text-center text-sm sm:text-base">
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
