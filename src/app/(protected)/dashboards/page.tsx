import { OverviewDashboardRefactored as OverviewDashboard } from '@/features/dashboards/components/overview-dashboard'

export default function DashboardsPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Portfolio Overview</h1>
            </div>
            <OverviewDashboard />
        </div>
    )
}
