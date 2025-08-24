import { CommoditiesDashboard } from '@/features/dashboards/components/commodities-dashboard'

export default function CommoditiesPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Commodities</h1>
                <p className="text-muted-foreground">
                    Gold, silver, bitcoin and other commodity investments
                </p>
            </div>
            <CommoditiesDashboard />
        </div>
    )
}
