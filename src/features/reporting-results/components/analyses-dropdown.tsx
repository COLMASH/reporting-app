'use client'

import { useState } from 'react'
import { useGetFileAnalysesQuery } from '@/redux/services/reportingAnalysesApi'
import { AnalysisResponse } from '@/redux/services/reportingAnalysesApi'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronDown, FileSearch, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalysesDropdownProps {
    fileId: string
    onAnalysisSelect: (analysis: AnalysisResponse) => void
}

export const AnalysesDropdown = ({ fileId, onAnalysisSelect }: AnalysesDropdownProps) => {
    const { data, isLoading, error } = useGetFileAnalysesQuery(fileId)
    const [open, setOpen] = useState(false)

    // Filter for completed analyses only
    const completedAnalyses =
        data?.analyses.filter(analysis => analysis.status === 'completed') || []

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleSelect = (analysis: AnalysisResponse) => {
        onAnalysisSelect(analysis)
        setOpen(false)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-2">
                <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
            </div>
        )
    }

    if (error) {
        return <span className="text-destructive text-xs">Error loading analyses</span>
    }

    if (completedAnalyses.length === 0) {
        return <span className="text-muted-foreground text-xs">No analyses</span>
    }

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn('h-8 w-full justify-between px-2 text-xs', 'hover:bg-muted/50')}
                >
                    <span className="flex items-center gap-1">
                        <FileSearch className="h-3 w-3" />
                        {completedAnalyses.length}{' '}
                        {completedAnalyses.length === 1 ? 'analysis' : 'analyses'}
                    </span>
                    <ChevronDown
                        className={cn('h-3 w-3 transition-transform', {
                            'rotate-180': open
                        })}
                    />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Completed Analyses</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {completedAnalyses.map(analysis => (
                    <DropdownMenuItem
                        key={analysis.id}
                        onClick={() => handleSelect(analysis)}
                        className="cursor-pointer"
                    >
                        <div className="flex w-full flex-col">
                            <span className="text-sm font-medium">
                                {formatDate(analysis.completed_at || analysis.created_at)}
                            </span>
                            {analysis.parameters?.focus && (
                                <span className="text-muted-foreground text-xs">
                                    Focus: {analysis.parameters.focus}
                                </span>
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
