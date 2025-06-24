import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { LoginForm } from '@/components/auth/login-form'

export default async function HomePage() {
    const session = await auth()

    if (session?.user) {
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl leading-9 font-bold tracking-tight text-gray-900">
                    Sign in to your account
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <LoginForm />
            </div>
        </div>
    )
}
