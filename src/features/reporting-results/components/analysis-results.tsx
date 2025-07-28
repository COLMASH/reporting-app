'use client'

import { useGetAnalysisResultsQuery } from '@/redux/services/resultsApi'
import { Loader2 } from 'lucide-react'
import { ChartVisualization } from './chart-visualization'
import { MetricsGrid } from './metrics-grid'
import { DataQualityReport } from './data-quality-report'
import { SummaryCard } from './summary-card'
import { RecommendationsList } from './recommendations-list'
import type { Visualization, KeyMetric, DataQuality } from '@/redux/services/reportingAnalysesApi'

interface AnalysisResultsProps {
    analysisId: string
}

export const AnalysisResults = ({ analysisId }: AnalysisResultsProps) => {
    const { data, isLoading, error } = useGetAnalysisResultsQuery(analysisId)

    if (isLoading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="text-destructive flex h-96 items-center justify-center">
                Failed to load analysis results. Please try again.
            </div>
        )
    }

    // Parse results from backend
    let summary = ''
    let keyMetrics: KeyMetric[] = []
    const visualizations: Visualization[] = []
    let dataQuality: DataQuality | null = null
    let recommendations: string[] = []

    // Sort results by order_index to ensure proper display order
    const sortedResults = [...data.results].sort((a, b) => a.order_index - b.order_index)

    // Process each result based on its type
    sortedResults.forEach(result => {
        switch (result.result_type) {
            case 'summary':
                summary = result.insight_text || ''
                break
            case 'metrics':
                if (result.insight_data && Array.isArray(result.insight_data)) {
                    keyMetrics = result.insight_data as KeyMetric[]
                }
                break
            case 'visualization':
                if (
                    result.insight_data &&
                    typeof result.insight_data === 'object' &&
                    !Array.isArray(result.insight_data)
                ) {
                    visualizations.push(result.insight_data as unknown as Visualization)
                }
                break
            case 'data_quality':
                if (
                    result.insight_data &&
                    typeof result.insight_data === 'object' &&
                    !Array.isArray(result.insight_data)
                ) {
                    dataQuality = result.insight_data as unknown as DataQuality
                }
                break
            case 'recommendations':
                if (result.insight_data && Array.isArray(result.insight_data)) {
                    recommendations = result.insight_data as string[]
                }
                break
        }
    })

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Summary Section */}
            {summary && <SummaryCard summary={summary} />}

            {/* Key Metrics Section */}
            {keyMetrics.length > 0 && (
                <div>
                    <h2 className="text-foreground mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl">
                        Key Metrics
                    </h2>
                    <MetricsGrid metrics={keyMetrics} />
                </div>
            )}

            {/* Visualizations Section */}
            {visualizations.length > 0 && (
                <div>
                    <h2 className="text-foreground mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl">
                        Data Visualizations
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                        {visualizations.map((viz, index) => (
                            <ChartVisualization
                                key={index}
                                chartType={viz.chart_type}
                                title={viz.title}
                                description={viz.description}
                                data={viz.data}
                                options={viz.options}
                                insights={viz.insights}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Data Quality Section */}
            {dataQuality && (
                <div>
                    <h2 className="text-foreground mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl">
                        Data Quality Analysis
                    </h2>
                    <DataQualityReport dataQuality={dataQuality} />
                </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
                <div>
                    <h2 className="text-foreground mb-3 text-xl font-semibold sm:mb-4 sm:text-2xl">
                        Strategic Recommendations
                    </h2>
                    <RecommendationsList recommendations={recommendations} />
                </div>
            )}
        </div>
    )
}
