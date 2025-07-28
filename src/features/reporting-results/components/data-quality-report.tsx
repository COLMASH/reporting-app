'use client'

import { AlertCircle, CheckCircle, FileSpreadsheet, XCircle } from 'lucide-react'
import { AnalysisResultCard } from './analysis-result-card'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { DataQuality } from '@/redux/services/reportingAnalysesApi'

interface DataQualityReportProps {
    dataQuality: DataQuality
    className?: string
}

const getQualityColor = (score: DataQuality['quality_score']) => {
    switch (score) {
        case 'high':
            return 'text-success'
        case 'medium':
            return 'text-warning'
        case 'low':
            return 'text-destructive'
    }
}

const getQualityIcon = (score: DataQuality['quality_score']) => {
    switch (score) {
        case 'high':
            return <CheckCircle className="h-5 w-5" />
        case 'medium':
            return <AlertCircle className="h-5 w-5" />
        case 'low':
            return <XCircle className="h-5 w-5" />
    }
}

export const DataQualityReport = ({ dataQuality, className }: DataQualityReportProps) => {
    const missingValuesEntries = Object.entries(dataQuality.missing_values || {})
    const dataTypesEntries = Object.entries(dataQuality.data_types || {})

    return (
        <AnalysisResultCard
            title="Data Quality Report"
            description="Assessment of the uploaded file's data quality and structure"
            className={className}
        >
            <div className="space-y-6">
                {/* Quality Score */}
                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
                    <div>
                        <h4 className="text-sm font-medium">Overall Quality Score</h4>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Based on completeness and consistency
                        </p>
                    </div>
                    <div
                        className={cn(
                            'flex items-center gap-2 text-lg font-semibold',
                            getQualityColor(dataQuality.quality_score)
                        )}
                    >
                        {getQualityIcon(dataQuality.quality_score)}
                        <span className="capitalize">{dataQuality.quality_score}</span>
                    </div>
                </div>

                {/* File Stats */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <p className="text-muted-foreground text-sm">Total Rows</p>
                        <p className="text-foreground mt-1 text-2xl font-bold">
                            {dataQuality.total_rows.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <p className="text-muted-foreground text-sm">Total Columns</p>
                        <p className="text-foreground mt-1 text-2xl font-bold">
                            {dataQuality.total_columns}
                        </p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <p className="text-muted-foreground text-sm">Sheets Analyzed</p>
                        <p className="text-foreground mt-1 text-2xl font-bold">
                            {dataQuality.sheets_analyzed.length}
                        </p>
                    </div>
                </div>

                {/* Sheets */}
                {dataQuality.sheets_analyzed.length > 0 && (
                    <div>
                        <h4 className="mb-3 text-sm font-medium">Sheets Analyzed</h4>
                        <div className="flex flex-wrap gap-2">
                            {dataQuality.sheets_analyzed.map((sheet, index) => (
                                <Badge key={index} variant="outline" className="gap-1">
                                    <FileSpreadsheet className="h-3 w-3" />
                                    {sheet}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Data Types */}
                {dataTypesEntries.length > 0 && (
                    <div>
                        <h4 className="mb-3 text-sm font-medium">Column Data Types</h4>
                        <div className="bg-muted/30 max-h-48 overflow-y-auto rounded-lg p-3">
                            <div className="space-y-2">
                                {dataTypesEntries.map(([column, type]) => (
                                    <div
                                        key={column}
                                        className="text-muted-foreground flex items-center justify-between text-sm"
                                    >
                                        <span className="font-medium">{column}</span>
                                        <Badge variant="secondary" className="text-xs">
                                            {type}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Missing Values */}
                {missingValuesEntries.length > 0 && (
                    <div>
                        <h4 className="mb-3 text-sm font-medium">Missing Values</h4>
                        <div className="bg-muted/30 max-h-48 overflow-y-auto rounded-lg p-3">
                            <div className="space-y-2">
                                {missingValuesEntries
                                    .filter(([, count]) => count > 0)
                                    .map(([column, count]) => (
                                        <div
                                            key={column}
                                            className="flex items-center justify-between text-sm"
                                        >
                                            <span className="text-muted-foreground font-medium">
                                                {column}
                                            </span>
                                            <Badge
                                                variant={
                                                    count > dataQuality.total_rows * 0.1
                                                        ? 'destructive'
                                                        : 'secondary'
                                                }
                                                className="text-xs"
                                            >
                                                {count} missing
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Issues */}
                {dataQuality.issues.length > 0 && (
                    <div>
                        <h4 className="mb-3 text-sm font-medium">Quality Issues</h4>
                        <div className="space-y-2">
                            {dataQuality.issues.map((issue, index) => (
                                <div
                                    key={index}
                                    className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg p-3 text-sm"
                                >
                                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>{issue}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AnalysisResultCard>
    )
}
