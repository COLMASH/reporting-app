'use client'

/**
 * Summary table showing asset type breakdown with financial metrics.
 * Displays NAV, cost basis, unfunded commitments per asset class.
 * Features: sorting, filtering, pagination.
 */

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShimmerOverlay } from '@/components/ui/shimmer-overlay'
import {
    TableIcon,
    Search,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { transformAssetTypeForTable, type AssetTypeSummaryRow } from '../../utils/api-transformers'
import { formatCompactCurrency, formatPercentage } from '@/redux/services/portfolioApi'
import { cn } from '@/lib/utils'
import type { AssetTypeAggregationResponse } from '@/redux/services/portfolioApi'
import type { CurrencyType } from '../../hooks/use-portfolio-filters'

export interface AssetTypeSummaryTableProps {
    data: AssetTypeAggregationResponse | undefined
    eurData?: AssetTypeAggregationResponse
    currency?: CurrencyType
    isLoading?: boolean
    isFetching?: boolean
    onRowClick?: (assetType: string) => void
}

interface TableState {
    sortBy: keyof AssetTypeSummaryRow
    sortOrder: 'asc' | 'desc'
    search: string
    page: number
    pageSize: number
}

interface SortableColumnProps {
    column: keyof AssetTypeSummaryRow
    label: string
    sortBy: keyof AssetTypeSummaryRow
    sortOrder: 'asc' | 'desc'
    onSort: (column: keyof AssetTypeSummaryRow) => void
    align?: 'left' | 'right'
}

const SortableColumn = ({
    column,
    label,
    sortBy,
    sortOrder,
    onSort,
    align = 'left'
}: SortableColumnProps) => {
    const isSorted = sortBy === column

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

export const AssetTypeSummaryTable = ({
    data,
    eurData,
    currency = 'USD',
    isLoading = false,
    isFetching = false,
    onRowClick
}: AssetTypeSummaryTableProps) => {
    const isEur = currency === 'EUR'
    // Use EUR data when EUR is selected and available
    const activeData = isEur && eurData ? eurData : data
    const [tableState, setTableState] = useState<TableState>({
        sortBy: 'valueUsd',
        sortOrder: 'desc',
        search: '',
        page: 1,
        pageSize: 10
    })

    const rawTableData = useMemo(() => transformAssetTypeForTable(activeData), [activeData])

    // Filter, sort, and paginate data
    const { paginatedData, totalPages, totalFiltered } = useMemo(() => {
        let result = [...rawTableData]

        // Filter by search
        if (tableState.search) {
            const searchLower = tableState.search.toLowerCase()
            result = result.filter(row => row.assetType.toLowerCase().includes(searchLower))
        }

        // Sort
        result.sort((a, b) => {
            const aVal = a[tableState.sortBy]
            const bVal = b[tableState.sortBy]
            const modifier = tableState.sortOrder === 'asc' ? 1 : -1

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * modifier
            }
            return ((aVal as number) - (bVal as number)) * modifier
        })

        const totalFiltered = result.length
        const totalPages = Math.ceil(result.length / tableState.pageSize)

        // Paginate
        const paginated = result.slice(
            (tableState.page - 1) * tableState.pageSize,
            tableState.page * tableState.pageSize
        )

        return { paginatedData: paginated, totalPages, totalFiltered }
    }, [rawTableData, tableState])

    const handleSort = useCallback((column: keyof AssetTypeSummaryRow) => {
        setTableState(prev => ({
            ...prev,
            sortBy: column,
            sortOrder: prev.sortBy === column && prev.sortOrder === 'desc' ? 'asc' : 'desc',
            page: 1
        }))
    }, [])

    const handleSearch = useCallback((value: string) => {
        setTableState(prev => ({ ...prev, search: value, page: 1 }))
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setTableState(prev => ({ ...prev, page }))
    }, [])

    const isLoadingState = isLoading || isFetching

    return (
        <Card className="relative">
            <ShimmerOverlay isActive={isLoadingState} />
            <CardHeader className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base font-medium">Asset Type Summary</CardTitle>
                        <CardDescription>
                            {totalFiltered} of {rawTableData.length} asset types
                        </CardDescription>
                    </div>
                    <TableIcon className="text-muted-foreground h-5 w-5 sm:hidden" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                        <Input
                            placeholder="Filter asset types..."
                            value={tableState.search}
                            onChange={e => handleSearch(e.target.value)}
                            className="w-full pl-9 sm:w-48"
                        />
                    </div>
                    <TableIcon className="text-muted-foreground hidden h-5 w-5 sm:block" />
                </div>
            </CardHeader>
            <CardContent>
                {isLoadingState ? (
                    <div className="h-[200px]" />
                ) : paginatedData.length === 0 ? (
                    <div className="text-muted-foreground flex h-32 items-center justify-center">
                        {tableState.search ? 'No matching asset types' : 'No data available'}
                    </div>
                ) : (
                    <>
                        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                            <Table className="w-[99.5%] min-w-[600px]">
                                <TableHeader>
                                    <TableRow>
                                        <SortableColumn
                                            column="assetType"
                                            label="Asset Type"
                                            sortBy={tableState.sortBy}
                                            sortOrder={tableState.sortOrder}
                                            onSort={handleSort}
                                        />
                                        <SortableColumn
                                            column="valueUsd"
                                            label={`NAV (${currency})`}
                                            sortBy={tableState.sortBy}
                                            sortOrder={tableState.sortOrder}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                        <SortableColumn
                                            column="paidInCapitalUsd"
                                            label={`Cost Basis (${currency})`}
                                            sortBy={tableState.sortBy}
                                            sortOrder={tableState.sortOrder}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                        <SortableColumn
                                            column="percentage"
                                            label="Allocation"
                                            sortBy={tableState.sortBy}
                                            sortOrder={tableState.sortOrder}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                        <SortableColumn
                                            column="count"
                                            label="Positions"
                                            sortBy={tableState.sortBy}
                                            sortOrder={tableState.sortOrder}
                                            onSort={handleSort}
                                            align="right"
                                        />
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.map((row: AssetTypeSummaryRow) => (
                                        <TableRow
                                            key={row.assetType}
                                            className={cn({
                                                'hover:bg-muted/80 cursor-pointer': !!onRowClick
                                            })}
                                            onClick={
                                                onRowClick
                                                    ? () => onRowClick(row.assetType)
                                                    : undefined
                                            }
                                        >
                                            <TableCell className="font-medium">
                                                {row.assetType}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCompactCurrency(row.valueUsd, currency)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCompactCurrency(
                                                    row.paidInCapitalUsd,
                                                    currency
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatPercentage(row.percentage / 100)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {row.count}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-muted-foreground text-sm">
                                    Page {tableState.page} of {totalPages}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={tableState.page <= 1}
                                        onClick={() => handlePageChange(tableState.page - 1)}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={tableState.page >= totalPages}
                                        onClick={() => handlePageChange(tableState.page + 1)}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
