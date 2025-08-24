import { EquitiesDashboard } from '@/features/dashboards/components/equities-dashboard'

export default function EquitiesPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Equities</h1>
                <p className="text-muted-foreground">
                    Stock market investments and equity positions
                </p>
            </div>
            <EquitiesDashboard />
        </div>
    )
}
