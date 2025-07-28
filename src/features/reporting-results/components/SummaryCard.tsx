'use client'

import { FileText } from 'lucide-react'
import { AnalysisResultCard } from './AnalysisResultCard'

interface SummaryCardProps {
    summary: string
    className?: string
}

export const SummaryCard = ({ summary, className }: SummaryCardProps) => {
    return (
        <AnalysisResultCard
            title="Executive Summary"
            description="Key findings and insights from the analysis"
            className={className}
        >
            <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="bg-muted/30 rounded-lg p-6">
                    <div className="mb-4 flex items-center gap-2">
                        <FileText className="text-primary h-5 w-5" />
                        <h4 className="text-foreground text-base font-semibold">Summary</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{summary}</p>
                </div>
            </div>
        </AnalysisResultCard>
    )
}
