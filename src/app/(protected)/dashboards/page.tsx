import { Suspense } from 'react'
import { CeoDashboard } from '@/features/dashboards/components/ceo-dashboard'
import { Skeleton } from '@/components/ui/skeleton'

const DashboardSkeleton = () => (
    <div className="flex h-screen">
        <div className="w-60 space-y-2 border-r p-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
            ))}
        </div>
        <div className="flex-1 space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
                <Skeleton className="h-[400px]" />
                <Skeleton className="h-[400px]" />
            </div>
        </div>
    </div>
)

export default function DashboardsPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <CeoDashboard />
        </Suspense>
    )
}
