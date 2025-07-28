'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { AnalysisResults } from '@/features/reporting-results/components/analysis-results'
import { AnalysisResponse } from '@/redux/services/reportingAnalysesApi'
import { FileSpreadsheet } from 'lucide-react'

interface AnalysisResultsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    analysis: AnalysisResponse | null
    fileName?: string
}

export const AnalysisResultsDialog = ({
    open,
    onOpenChange,
    analysis,
    fileName
}: AnalysisResultsDialogProps) => {
    if (!analysis) return null

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="h-[85vh] w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] p-0 sm:h-[90vh] sm:w-[90vw] sm:max-w-7xl">
                <DialogHeader className="border-border border-b px-3 py-2.5 sm:px-4 sm:py-3 md:px-6 md:py-4">
                    <DialogTitle className="flex items-center gap-1.5 text-base sm:gap-2 sm:text-lg md:text-xl">
                        <FileSpreadsheet className="h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5" />
                        <span className="truncate">Analysis Results</span>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Analysis results for {fileName || 'uploaded file'}
                    </DialogDescription>
                    <div className="text-muted-foreground mt-1.5 space-y-0.5 text-xs sm:mt-2 sm:space-y-1 sm:text-sm">
                        {fileName && (
                            <p className="truncate pr-8">
                                <span className="font-medium">File:</span> {fileName}
                            </p>
                        )}
                        <p className="flex flex-col sm:block">
                            <span className="font-medium">Analyzed:</span>{' '}
                            <span className="text-xs sm:text-sm">
                                {formatDate(analysis.completed_at || analysis.created_at)}
                            </span>
                        </p>
                        {analysis.parameters?.focus && (
                            <p className="truncate">
                                <span className="font-medium">Focus:</span>{' '}
                                {analysis.parameters.focus}
                            </p>
                        )}
                    </div>
                </DialogHeader>
                <div className="flex-1 overflow-x-hidden overflow-y-auto px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6">
                    <AnalysisResults analysisId={analysis.id} />
                </div>
            </DialogContent>
        </Dialog>
    )
}
