'use client'

/**
 * CEO Dashboard - Main portfolio dashboard component.
 * Composes all dashboard components with data from RTK Query.
 * Supports URL-based filtering for shareable links.
 */

import { useState, useCallback, useEffect, useMemo } from 'react'
import { usePortfolioFilters, type AssetTabType } from '../hooks/use-portfolio-filters'
import { useDashboardData, useAssetTable } from '../hooks/use-dashboard-data'
import { getAvailableAssetTypes } from '../utils/api-transformers'
import { getAssetTypeFilter, TAB_TO_ASSET_TYPE, TAB_CONFIG } from './navigation/asset-type-tabs'

// Layout components
import { EntitySidebar, MobileEntitySidebar } from './layout/entity-sidebar'
import { AssetTypeTabs } from './navigation/asset-type-tabs'
import { DashboardHeader } from './common/dashboard-header'

// Card components
import { KpiCards } from './cards/kpi-cards'

// Chart components
import { EntityDonutChart } from './charts/entity-donut-chart'
import { AssetTypeDonutChart } from './charts/asset-type-donut-chart'
import { HistoricalNavChart } from './charts/historical-nav-chart'

// Table components
import { AssetTypeSummaryTable } from './tables/asset-type-summary-table'
import { DetailedDataTable } from './tables/detailed-data-table'
import { AssetDetailModal } from './tables/asset-detail-modal'

import { Card, CardContent } from '@/components/ui/card'
import { Construction } from 'lucide-react'

import type { AssetResponse, SortOrder } from '@/redux/services/portfolioApi'

// Entities with active dashboards (empty string = Consolidated View)
const ACTIVE_ENTITIES = new Set(['', 'Isis Invest'])

/**
 * Work in Progress placeholder for entities without active dashboards
 */
const WorkInProgressPlaceholder = ({ entityName }: { entityName: string }) => (
    <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
                <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                    <Construction className="text-muted-foreground h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{entityName} Dashboard</h3>
                    <p className="text-muted-foreground text-sm">
                        This entity dashboard is currently under development. Please check back soon
                        or select another entity.
                    </p>
                </div>
                <div className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-xs font-medium">
                    Work in Progress
                </div>
            </CardContent>
        </Card>
    </div>
)

export const CeoDashboard = () => {
    // URL-synchronized filters
    const { filters, setEntity, setTab, setReportDate, setCurrency, setFilters } =
        usePortfolioFilters()

    // Dashboard data from RTK Query
    const dashboardData = useDashboardData()

    // Table state
    const [tableParams, setTableParams] = useState({
        page: 1,
        pageSize: 20,
        sortBy: 'estimated_asset_value_usd',
        sortOrder: 'desc' as SortOrder,
        search: ''
    })

    // Asset detail modal state
    const [selectedAsset, setSelectedAsset] = useState<AssetResponse | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Fetch table data with current params
    const tableData = useAssetTable(tableParams)

    // Sync tab changes to asset type filter
    useEffect(() => {
        const assetTypeFilter = getAssetTypeFilter(filters.tab)
        if (assetTypeFilter !== filters.assetType) {
            setFilters({ assetType: assetTypeFilter })
        }
    }, [filters.tab, filters.assetType, setFilters])

    // Extract available asset types from byAssetType response
    const availableAssetTypes = useMemo(
        () => getAvailableAssetTypes(dashboardData.byAssetType),
        [dashboardData.byAssetType]
    )

    // Auto-redirect if current tab is not available for selected entity
    useEffect(() => {
        // Don't redirect while loading or if no data yet
        if (dashboardData.isLoading || !availableAssetTypes.size) return

        // Overview is always valid
        if (filters.tab === 'overview') return

        const currentAssetType = TAB_TO_ASSET_TYPE[filters.tab]

        // Check if current tab is available
        if (currentAssetType && !availableAssetTypes.has(currentAssetType)) {
            // Find first available tab (skip overview, prefer asset tabs)
            const firstAvailable = TAB_CONFIG.find(tab => {
                if (tab.value === 'overview') return false
                const assetType = TAB_TO_ASSET_TYPE[tab.value]
                return assetType ? availableAssetTypes.has(assetType) : false
            })

            // Redirect to first available, or overview if none
            setTab((firstAvailable?.value || 'overview') as AssetTabType)
        }
    }, [availableAssetTypes, filters.tab, dashboardData.isLoading, setTab])

    // Event handlers
    const handleEntityClick = useCallback(
        (entityName: string) => {
            setEntity(entityName)
        },
        [setEntity]
    )

    const handleAssetTypeClick = useCallback(
        (assetType: string) => {
            // Map asset type name to tab value
            const tabMapping: Record<string, string> = {
                Equities: 'equities',
                Bonds: 'bonds',
                'Structured notes': 'structured-notes',
                'Real Estate': 'real-estate',
                'Alternative assets': 'alternatives',
                Commodities: 'commodities',
                Cryptocurrency: 'crypto',
                'Cash and Money Market Funds': 'cash'
            }
            const tab = tabMapping[assetType]
            if (tab) {
                setTab(tab as AssetTabType)
            }
        },
        [setTab]
    )

    const handleRowClick = useCallback((asset: AssetResponse) => {
        setSelectedAsset(asset)
        setIsModalOpen(true)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setTableParams(prev => ({ ...prev, page }))
    }, [])

    // Map EUR column names to USD equivalents for API sorting
    // The relative ordering is the same regardless of currency
    const mapToUsdColumn = (column: string): string => {
        const eurToUsd: Record<string, string> = {
            estimated_asset_value_eur: 'estimated_asset_value_usd',
            paid_in_capital_eur: 'paid_in_capital_usd',
            total_asset_return_eur: 'total_asset_return_usd'
        }
        return eurToUsd[column] || column
    }

    const handleSortChange = useCallback((sortBy: string, sortOrder: SortOrder) => {
        // Always use USD columns for API sorting
        const apiSortBy = mapToUsdColumn(sortBy)
        setTableParams(prev => ({ ...prev, sortBy: apiSortBy, sortOrder, page: 1 }))
    }, [])

    const handleSearchChange = useCallback((search: string) => {
        setTableParams(prev => ({ ...prev, search, page: 1 }))
    }, [])

    // Check if entity has an active dashboard
    const isEntityActive = ACTIVE_ENTITIES.has(filters.entity || '')

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Entity Sidebar */}
            <EntitySidebar
                entities={dashboardData.filters?.entities || []}
                selectedEntity={filters.entity}
                onEntityChange={setEntity}
                isLoading={dashboardData.isFiltersLoading}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <DashboardHeader
                    title="Portfolio Dashboard"
                    subtitle={
                        filters.entity
                            ? `Viewing: ${filters.entity}`
                            : 'Consolidated View - All Entities'
                    }
                    reportDates={dashboardData.filters?.report_dates || []}
                    selectedReportDate={filters.reportDate}
                    onReportDateChange={setReportDate}
                    currency={filters.currency}
                    onCurrencyChange={setCurrency}
                    onRefresh={dashboardData.refresh}
                    isRefreshing={dashboardData.isFetching}
                    isLoading={dashboardData.isFiltersLoading}
                    mobileMenu={
                        <MobileEntitySidebar
                            entities={dashboardData.filters?.entities || []}
                            selectedEntity={filters.entity}
                            onEntityChange={setEntity}
                            isLoading={dashboardData.isFiltersLoading}
                        />
                    }
                />

                {isEntityActive ? (
                    <>
                        {/* Asset Type Tabs */}
                        <div className="px-6 pt-4">
                            <AssetTypeTabs
                                activeTab={filters.tab}
                                onTabChange={setTab}
                                availableAssetTypes={availableAssetTypes}
                                isLoading={dashboardData.isLoading}
                            />
                        </div>

                        {/* Dashboard Content */}
                        <main className="flex-1 space-y-6 overflow-y-auto p-6">
                            {/* KPI Cards */}
                            <KpiCards
                                data={dashboardData.summary}
                                eurSummary={dashboardData.eurSummary}
                                currency={filters.currency}
                                isLoading={
                                    dashboardData.isSummaryLoading || dashboardData.isEurLoading
                                }
                                isFetching={dashboardData.isFetching}
                            />

                            {/* Charts Row */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                <EntityDonutChart
                                    data={dashboardData.byEntity}
                                    currency={filters.currency}
                                    isLoading={dashboardData.isChartsLoading}
                                    isFetching={dashboardData.isFetching}
                                    onEntityClick={handleEntityClick}
                                />
                                <AssetTypeDonutChart
                                    data={dashboardData.byAssetType}
                                    currency={filters.currency}
                                    isLoading={dashboardData.isChartsLoading}
                                    isFetching={dashboardData.isFetching}
                                    onAssetTypeClick={handleAssetTypeClick}
                                />
                            </div>

                            {/* Historical NAV Chart */}
                            <HistoricalNavChart
                                data={dashboardData.historicalNav}
                                currency={filters.currency}
                                isLoading={dashboardData.isChartsLoading}
                                isFetching={dashboardData.isFetching}
                            />

                            {/* Summary Table */}
                            <AssetTypeSummaryTable
                                data={dashboardData.byAssetType}
                                eurData={dashboardData.eurByAssetType}
                                currency={filters.currency}
                                isLoading={
                                    dashboardData.isChartsLoading || dashboardData.isEurLoading
                                }
                                isFetching={dashboardData.isFetching}
                                onRowClick={handleAssetTypeClick}
                            />

                            {/* Detailed Data Table */}
                            <DetailedDataTable
                                data={tableData.data}
                                isLoading={tableData.isLoading}
                                isFetching={tableData.isFetching}
                                currency={filters.currency}
                                onRowClick={handleRowClick}
                                onPageChange={handlePageChange}
                                onSortChange={handleSortChange}
                                onSearchChange={handleSearchChange}
                                currentSort={{
                                    sortBy: tableParams.sortBy,
                                    sortOrder: tableParams.sortOrder
                                }}
                                searchValue={tableParams.search}
                            />
                        </main>
                    </>
                ) : (
                    <WorkInProgressPlaceholder entityName={filters.entity || 'Unknown'} />
                )}
            </div>

            {/* Asset Detail Modal */}
            <AssetDetailModal
                asset={selectedAsset}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div>
    )
}
