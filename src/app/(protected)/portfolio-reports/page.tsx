'use client'

import { Suspense } from 'react'
import { PortfolioReportsPage } from '@/features/portfolio-reports/components/portfolio-reports-page'

export default function Page() {
    return (
        <Suspense fallback={null}>
            <PortfolioReportsPage />
        </Suspense>
    )
}
