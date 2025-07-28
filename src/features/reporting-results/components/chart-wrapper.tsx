'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import ChartVisualization to ensure Chart.js is loaded properly
export const ChartWrapper = dynamic(
    () => import('./chart-visualization').then(mod => ({ default: mod.ChartVisualization })),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-80 items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }
)
