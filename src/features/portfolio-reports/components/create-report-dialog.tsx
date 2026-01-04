'use client'

import { useState, useCallback, useEffect } from 'react'
import { Loader2, Sparkles, Globe } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { useGetFiltersQuery } from '@/redux/services/portfolioApi'
import { toast } from 'sonner'
import type { CreateReportRequest, ReportScope, ReportResponse } from '../types'

interface CreateReportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (request: CreateReportRequest) => Promise<ReportResponse>
    isSubmitting?: boolean
    initialFilters?: {
        holdingCompany?: string | null
        assetType?: string | null
        reportDate?: string | null
    }
}

const SCOPE_OPTIONS: { value: ReportScope; label: string; description: string }[] = [
    {
        value: 'single_date',
        label: 'Point-in-Time',
        description: 'Analysis at a specific date'
    },
    {
        value: 'all_dates',
        label: 'Historical Trends',
        description: 'Analysis across all available dates'
    }
]

const DEFAULT_TITLE = 'Portfolio Analysis Report'

export const CreateReportDialog = ({
    open,
    onOpenChange,
    onSubmit,
    isSubmitting = false,
    initialFilters
}: CreateReportDialogProps) => {
    // Form state
    const [title, setTitle] = useState(DEFAULT_TITLE)
    const [scope, setScope] = useState<ReportScope>('single_date')
    const [reportDate, setReportDate] = useState<string | null>(null)
    const [holdingCompanyFilter, setHoldingCompanyFilter] = useState<string | null>(null)
    const [assetTypeFilter, setAssetTypeFilter] = useState<string | null>(null)
    const [entityFilter, setEntityFilter] = useState<string | null>(null)
    const [userPrompt, setUserPrompt] = useState('')
    const [researchEnabled, setResearchEnabled] = useState(false)

    // Fetch filter options from API
    const { data: filters, isLoading: isLoadingFilters } = useGetFiltersQuery()

    // Pre-fill filters from dashboard when dialog opens
    useEffect(() => {
        if (open && initialFilters) {
            if (initialFilters.holdingCompany) {
                setHoldingCompanyFilter(initialFilters.holdingCompany)
            }
            if (initialFilters.assetType) {
                setAssetTypeFilter(initialFilters.assetType)
            }
            if (initialFilters.reportDate) {
                setReportDate(initialFilters.reportDate)
            }
        }
    }, [open, initialFilters])

    // Reset form when dialog closes
    useEffect(() => {
        if (!open) {
            setTitle(DEFAULT_TITLE)
            setScope('single_date')
            setReportDate(null)
            setHoldingCompanyFilter(null)
            setAssetTypeFilter(null)
            setEntityFilter(null)
            setUserPrompt('')
            setResearchEnabled(false)
        }
    }, [open])

    const handleSubmit = useCallback(async () => {
        try {
            const request: CreateReportRequest = {
                title: title.trim() || DEFAULT_TITLE,
                scope,
                report_date: scope === 'single_date' ? reportDate : null,
                holding_company_filter: holdingCompanyFilter,
                asset_type_filter: assetTypeFilter,
                entity_filter: entityFilter,
                user_prompt: userPrompt.trim() || null,
                research_enabled: researchEnabled
            }

            await onSubmit(request)
            toast.success('Report generation started', {
                description: 'Your report will be ready in 30-90 seconds.'
            })
        } catch (error) {
            toast.error('Failed to create report', {
                description: error instanceof Error ? error.message : 'Please try again.'
            })
        }
    }, [
        title,
        scope,
        reportDate,
        holdingCompanyFilter,
        assetTypeFilter,
        entityFilter,
        userPrompt,
        researchEnabled,
        onSubmit
    ])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Create AI Report
                    </DialogTitle>
                    <DialogDescription>
                        Generate an AI-powered analysis of your portfolio. The report will be
                        created in the background.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="title">Report Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder={DEFAULT_TITLE}
                            maxLength={255}
                        />
                    </div>

                    {/* Scope */}
                    <div className="grid gap-2">
                        <Label htmlFor="scope">Analysis Scope</Label>
                        <Select
                            value={scope}
                            onValueChange={value => setScope(value as ReportScope)}
                        >
                            <SelectTrigger id="scope">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {SCOPE_OPTIONS.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        <div>
                                            <div className="font-medium">{option.label}</div>
                                            <div className="text-muted-foreground text-xs">
                                                {option.description}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Report Date (only for single_date scope) */}
                    {scope === 'single_date' && (
                        <div className="grid gap-2">
                            <Label htmlFor="reportDate">Report Date</Label>
                            <Select
                                value={reportDate || 'latest'}
                                onValueChange={value =>
                                    setReportDate(value === 'latest' ? null : value)
                                }
                                disabled={isLoadingFilters}
                            >
                                <SelectTrigger id="reportDate">
                                    <SelectValue placeholder="Select date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Latest Available</SelectItem>
                                    {filters?.report_dates?.map(date => (
                                        <SelectItem key={date} value={date}>
                                            {new Date(date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    {/* Holding Company Filter */}
                    <div className="grid gap-2">
                        <Label htmlFor="holdingCompany">Holding Company</Label>
                        <Select
                            value={holdingCompanyFilter || 'all'}
                            onValueChange={value =>
                                setHoldingCompanyFilter(value === 'all' ? null : value)
                            }
                            disabled={isLoadingFilters}
                        >
                            <SelectTrigger id="holdingCompany">
                                <SelectValue placeholder="All companies" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Companies</SelectItem>
                                {filters?.holding_companies?.map(company => (
                                    <SelectItem key={company} value={company}>
                                        {company}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Asset Type Filter */}
                    <div className="grid gap-2">
                        <Label htmlFor="assetType">Asset Type</Label>
                        <Select
                            value={assetTypeFilter || 'all'}
                            onValueChange={value =>
                                setAssetTypeFilter(value === 'all' ? null : value)
                            }
                            disabled={isLoadingFilters}
                        >
                            <SelectTrigger id="assetType">
                                <SelectValue placeholder="All asset types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Asset Types</SelectItem>
                                {filters?.asset_types?.map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Entity Filter */}
                    <div className="grid gap-2">
                        <Label htmlFor="entity">Ownership Entity</Label>
                        <Select
                            value={entityFilter || 'all'}
                            onValueChange={value => setEntityFilter(value === 'all' ? null : value)}
                            disabled={isLoadingFilters}
                        >
                            <SelectTrigger id="entity">
                                <SelectValue placeholder="All entities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entities</SelectItem>
                                {filters?.entities?.map(entity => (
                                    <SelectItem key={entity} value={entity}>
                                        {entity}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Prompt */}
                    <div className="grid gap-2">
                        <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
                        <Textarea
                            id="prompt"
                            value={userPrompt}
                            onChange={e => setUserPrompt(e.target.value)}
                            placeholder="e.g., Focus on private equity performance and concentration risks..."
                            rows={3}
                        />
                        <p className="text-muted-foreground text-xs">
                            Provide specific focus areas or questions for the AI analysis.
                        </p>
                    </div>

                    {/* Research Toggle */}
                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="flex items-center gap-3">
                            <Globe className="text-muted-foreground h-5 w-5" />
                            <div>
                                <Label htmlFor="research" className="cursor-pointer font-medium">
                                    Enable Internet Research
                                </Label>
                                <p className="text-muted-foreground text-xs">
                                    Allow AI to search for current market data (slower)
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="research"
                            checked={researchEnabled}
                            onCheckedChange={setResearchEnabled}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate Report
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
