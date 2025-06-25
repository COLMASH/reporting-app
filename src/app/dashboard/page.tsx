import { auth } from '@/auth'
import { LogoutButton } from '@/features/auth/components/logout-button'

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <LogoutButton />
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
                    <div className="border-b border-gray-200 pb-5">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Welcome, {session.user.name || session.user.email}!
                        </h3>
                        <p className="mt-2 max-w-4xl text-sm text-gray-500">
                            This is your dashboard. Your account details are shown below.
                        </p>
                    </div>

                    <div className="mt-6 space-y-4">
                        <div>
                            <span className="text-sm font-medium text-gray-500">Email:</span>
                            <p className="mt-1 text-sm text-gray-900">{session.user.email}</p>
                        </div>
                        {session.user.name && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Name:</span>
                                <p className="mt-1 text-sm text-gray-900">{session.user.name}</p>
                            </div>
                        )}
                        {session.user.company_name && (
                            <div>
                                <span className="text-sm font-medium text-gray-500">Company:</span>
                                <p className="mt-1 text-sm text-gray-900">
                                    {session.user.company_name}
                                </p>
                            </div>
                        )}
                        <div>
                            <span className="text-sm font-medium text-gray-500">Role:</span>
                            <p className="mt-1 text-sm text-gray-900 capitalize">
                                {session.user.role}
                            </p>
                        </div>
                        <div>
                            <span className="text-sm font-medium text-gray-500">Status:</span>
                            <p className="mt-1 text-sm text-gray-900">
                                {session.user.is_active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
