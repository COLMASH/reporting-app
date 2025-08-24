import { AlternativeInvestmentsDashboard } from '@/features/dashboards/components/alternative-investments-dashboard'

export default function AlternativesPage() {
    return (
        <div className="container mx-auto py-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Alternative Investments</h1>
                <p className="text-muted-foreground">
                    Private equity, venture capital, and other alternative assets
                </p>
            </div>
            <AlternativeInvestmentsDashboard />
        </div>
    )
}
