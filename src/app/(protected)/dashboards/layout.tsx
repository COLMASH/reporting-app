import { ReactNode } from 'react'
import { DashboardNavigation } from '@/features/dashboards/components/dashboard-navigation'

export default function DashboardsLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-background min-h-screen">
            <DashboardNavigation />
            <main className="flex-1">{children}</main>
        </div>
    )
}
