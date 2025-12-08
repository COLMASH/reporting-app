'use client'

/**
 * Detailed data table showing all portfolio assets with pagination, sorting, and search.
 * Supports row click to open asset detail modal.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { ShimmerOverlay } from '@/components/ui/shimmer-overlay'
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search
} from 'lucide-react'
import {
    formatCompactCurrency,
    formatPercentageWithSign,
    formatDate,
    getPerformanceColorClass
} from '@/redux/services/portfolioApi'
import { cn } from '@/lib/utils'
import type {
    AssetResponse,
    AssetListResponse,
    SortOrder,
    PortfolioSummaryResponse
} from '@/redux/services/portfolioApi'
import type { CurrencyType } from '../../hooks/use-portfolio-filters'

export interface DetailedDataTableProps {
    data: AssetListResponse | undefined
    summary?: PortfolioSummaryResponse
    isLoading?: boolean
    isFetching?: boolean
    currency?: CurrencyType
    onRowClick?: (asset: AssetResponse) => void
    onPageChange?: (page: number) => void
    onPageSizeChange?: (pageSize: number) => void
    onSortChange?: (sortBy: string, sortOrder: SortOrder) => void
    onSearchChange?: (search: string) => void
    currentSort?: { sortBy: string; sortOrder: SortOrder }
    searchValue?: string
}

interface SortableColumnProps {
    column: string
    label: string
    currentSort?: { sortBy: string; sortOrder: SortOrder }
    onSort: (column: string) => void
    align?: 'left' | 'right'
}

// Helper to get base column name (without currency suffix)
// This allows matching columns regardless of USD/EUR toggle
const getBaseColumn = (column: string): string => {
    return column.replace('_usd', '').replace('_eur', '')
}

const SortableColumn = ({
    column,
    label,
    currentSort,
    onSort,
    align = 'left'
}: SortableColumnProps) => {
    // Match by base column name to handle currency switching
    const isSorted = currentSort?.sortBy
        ? getBaseColumn(currentSort.sortBy) === getBaseColumn(column)
        : false
    const sortOrder = currentSort?.sortOrder

    return (
        <TableHead className={cn({ 'text-right': align === 'right' })}>
            <Button
                variant="ghost"
                size="sm"
                className={cn('-ml-3 h-8', { '-mr-3 ml-auto': align === 'right' })}
                onClick={() => onSort(column)}
            >
                {label}
                {isSorted ? (
                    sortOrder === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
            </Button>
        </TableHead>
    )
}

export const DetailedDataTable = ({
    data,
    summary,
    isLoading = false,
    isFetching = false,
    currency = 'USD',
    onRowClick,
    onPageChange,
    onPageSizeChange,
    onSortChange,
    onSearchChange,
    currentSort = { sortBy: 'estimated_asset_value_usd', sortOrder: 'desc' },
    searchValue = ''
}: DetailedDataTableProps) => {
    const isEur = currency === 'EUR'

    // Column field names based on currency
    const navColumn = isEur ? 'estimated_asset_value_eur' : 'estimated_asset_value_usd'
    const costColumn = isEur ? 'paid_in_capital_eur' : 'paid_in_capital_usd'
    const [localSearch, setLocalSearch] = useState(searchValue)
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

    // Sync localSearch when external searchValue changes
    useEffect(() => {
        setLocalSearch(searchValue)
    }, [searchValue])

    // Debounced search effect - triggers API call after 400ms of no typing
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current)
        }

        // Don't trigger if value matches current (avoids loops)
        if (localSearch === searchValue) return

        debounceTimerRef.current = setTimeout(() => {
            onSearchChange?.(localSearch)
        }, 300)

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current)
            }
        }
    }, [localSearch, searchValue, onSearchChange])

    const handleSort = useCallback(
        (column: string) => {
            if (!onSortChange) return

            // Use getBaseColumn to compare regardless of USD/EUR suffix
            const isSameColumn = getBaseColumn(currentSort.sortBy) === getBaseColumn(column)
            const newOrder: SortOrder =
                isSameColumn && currentSort.sortOrder === 'desc' ? 'asc' : 'desc'
            onSortChange(column, newOrder)
        },
        [currentSort, onSortChange]
    )

    const isLoadingState = isLoading || isFetching
    const assets = data?.assets || []
    const { total = 0, page = 1, total_pages = 1 } = data || {}

    return (
        <Card className="relative">
            <ShimmerOverlay isActive={isLoadingState} />
            <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <CardTitle className="text-base font-medium">All Positions</CardTitle>
                    <CardDescription>
                        {total} {total === 1 ? 'asset' : 'assets'} in portfolio
                    </CardDescription>
                </div>
                <div className="relative flex-1 sm:flex-initial">
                    <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                    <Input
                        placeholder="Search assets..."
                        value={localSearch}
                        onChange={e => setLocalSearch(e.target.value)}
                        className="w-full pl-9 sm:w-64"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingState ? (
                    <div className="h-[300px]" />
                ) : assets.length === 0 ? (
                    <div className="text-muted-foreground flex h-32 items-center justify-center">
                        No assets found
                    </div>
                ) : (
                    <>
                        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                            <Table className="min-w-[1000px]">
                                <TableHeader>
                                    <TableRow>
                                        <SortableColumn
                                            column="asset_name"
                                            label="Asset Name"
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                        />
                                        <SortableColumn
                                            column="asset_type"
                                            label="Type"
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                        />
                                        <SortableColumn
                                            column="ownership_holding_entity"
                                            label="Entity"
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                        />
                                        <SortableColumn
                                            column="asset_group"
                                            label="Group"
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                        />
                                        <SortableColumn
                                            column="asset_group_strategy"
                                            label="Strategy"
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                        />
                                        <SortableColumn
                                            column={navColumn}
                                            label={`NAV (${currency})`}
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                        <SortableColumn
                                            column={costColumn}
                                            label={`Cost (${currency})`}
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                        <SortableColumn
                                            column={
                                                isEur
                                                    ? 'total_asset_return_eur'
                                                    : 'total_asset_return_usd'
                                            }
                                            label="Return"
                                            currentSort={currentSort}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                        <TableHead className="text-right">Report Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assets.map((asset: AssetResponse) => {
                                        const cost = isEur
                                            ? asset.paid_in_capital_eur
                                            : asset.paid_in_capital_usd
                                        const nav = isEur
                                            ? asset.estimated_asset_value_eur
                                            : asset.estimated_asset_value_usd
                                        // Calculate return as (Current Value - Cost) / Cost
                                        const returnPct =
                                            cost && cost > 0 ? ((nav || 0) - cost) / cost : null

                                        return (
                                            <TableRow
                                                key={asset.id}
                                                className={cn({
                                                    'hover:bg-muted/80 cursor-pointer': !!onRowClick
                                                })}
                                                onClick={
                                                    onRowClick ? () => onRowClick(asset) : undefined
                                                }
                                            >
                                                <TableCell className="max-w-[200px] truncate font-medium">
                                                    {asset.asset_name}
                                                </TableCell>
                                                <TableCell>{asset.asset_type}</TableCell>
                                                <TableCell className="max-w-[120px] truncate">
                                                    {asset.ownership_holding_entity}
                                                </TableCell>
                                                <TableCell className="max-w-[120px] truncate">
                                                    {asset.asset_group}
                                                </TableCell>
                                                <TableCell className="max-w-[120px] truncate">
                                                    {asset.asset_group_strategy || '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCompactCurrency(nav, currency)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCompactCurrency(cost, currency)}
                                                </TableCell>
                                                <TableCell
                                                    className={cn(
                                                        'text-right',
                                                        getPerformanceColorClass(returnPct)
                                                    )}
                                                >
                                                    {formatPercentageWithSign(returnPct)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatDate(asset.report_date)}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                                {summary && (
                                    <TableFooter className="bg-muted/50 border-t-2">
                                        <TableRow className="font-semibold">
                                            <TableCell>Total ({summary.total_assets})</TableCell>
                                            <TableCell>—</TableCell>
                                            <TableCell>—</TableCell>
                                            <TableCell>—</TableCell>
                                            <TableCell>—</TableCell>
                                            <TableCell className="text-right">
                                                {formatCompactCurrency(
                                                    isEur
                                                        ? summary.total_estimated_value_eur
                                                        : summary.total_estimated_value_usd,
                                                    currency
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCompactCurrency(
                                                    isEur
                                                        ? summary.total_paid_in_capital_eur
                                                        : summary.total_paid_in_capital_usd,
                                                    currency
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={cn(
                                                    'text-right',
                                                    getPerformanceColorClass(
                                                        summary.weighted_avg_return
                                                    )
                                                )}
                                            >
                                                {formatPercentageWithSign(
                                                    summary.weighted_avg_return
                                                )}
                                            </TableCell>
                                            <TableCell>—</TableCell>
                                        </TableRow>
                                    </TableFooter>
                                )}
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                            {/* Navigation buttons - centered on mobile, right on desktop */}
                            <div className="flex items-center justify-center gap-1 sm:order-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page <= 1}
                                    onClick={() => onPageChange?.(1)}
                                >
                                    <ChevronsLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page <= 1}
                                    onClick={() => onPageChange?.(page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {/* Page indicator - inline on mobile */}
                                <span className="text-muted-foreground min-w-[80px] text-center text-sm">
                                    {page} / {total_pages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page >= total_pages}
                                    onClick={() => onPageChange?.(page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    disabled={page >= total_pages}
                                    onClick={() => onPageChange?.(total_pages)}
                                >
                                    <ChevronsRight className="h-4 w-4" />
                                </Button>
                            </div>
                            {/* Rows per page selector - below nav on mobile, left on desktop */}
                            <div className="flex items-center justify-center gap-2 sm:order-1 sm:justify-start">
                                <span className="text-muted-foreground text-sm">Rows</span>
                                <Select
                                    value={String(data?.page_size || 10)}
                                    onValueChange={value => onPageSizeChange?.(Number(value))}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
