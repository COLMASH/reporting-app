'use client'

/**
 * CEO Dashboard - Main portfolio dashboard component.
 * Composes all dashboard components with data from RTK Query.
 * Supports URL-based filtering for shareable links.
 */

import { useState, useCallback, useEffect } from 'react'
import { usePortfolioFilters, type AssetTabType } from '../hooks/use-portfolio-filters'
import { useDashboardData, useAssetTable } from '../hooks/use-dashboard-data'
import { getAssetTypeFilter, TAB_TO_ASSET_TYPE, TAB_CONFIG } from './navigation/asset-type-tabs'

// Layout components
import { EntitySidebar, MobileEntitySidebar } from './layout/entity-sidebar'
import { AssetTypeTabs } from './navigation/asset-type-tabs'
import { DashboardHeader } from './common/dashboard-header'
import { ActiveFilters, type FilterKey } from './common/active-filters'

// Card components
import { KpiCards } from './cards/kpi-cards'

// Chart components
import { EntityDonutChart } from './charts/entity-donut-chart'
import { AssetTypeDonutChart } from './charts/asset-type-donut-chart'
import { DistributionDonutChart } from './charts/distribution-donut-chart'
import { HistoricalNavChart } from './charts/historical-nav-chart'

// Table components
import { AssetTypeSummaryTable } from './tables/asset-type-summary-table'
import { DetailedDataTable } from './tables/detailed-data-table'
import { AssetDetailModal } from './tables/asset-detail-modal'

import { Card, CardContent } from '@/components/ui/card'
import { Construction, Layers, Target } from 'lucide-react'

import type { AssetResponse, SortOrder } from '@/redux/services/portfolioApi'

// Holding companies with active dashboards (empty string = Consolidated View)
const ACTIVE_HOLDING_COMPANIES = new Set(['', 'Isis Invest'])

/**
 * Work in Progress placeholder for companies without active dashboards
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
                        This company dashboard is currently under development. Please check back
                        soon or select another company.
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
    const {
        filters,
        setHoldingCompany,
        setTab,
        setReportDate,
        setCurrency,
        setFilters,
        setManagingEntity,
        setAssetGroup,
        clearFilters
    } = usePortfolioFilters()

    // Dashboard data from RTK Query
    const dashboardData = useDashboardData()

    // Table state
    const [tableParams, setTableParams] = useState({
        page: 1,
        pageSize: 10,
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

    // Auto-redirect if current tab is not available for selected entity
    useEffect(() => {
        // Don't redirect while loading or if no data yet
        if (dashboardData.isLoading || !dashboardData.availableAssetTypes.size) return

        // Overview is always valid
        if (filters.tab === 'overview') return

        const currentAssetType = TAB_TO_ASSET_TYPE[filters.tab]

        // Check if current tab is available
        if (currentAssetType && !dashboardData.availableAssetTypes.has(currentAssetType)) {
            // Find first available tab (skip overview, prefer asset tabs)
            const firstAvailable = TAB_CONFIG.find(tab => {
                if (tab.value === 'overview') return false
                const assetType = TAB_TO_ASSET_TYPE[tab.value]
                return assetType ? dashboardData.availableAssetTypes.has(assetType) : false
            })

            // Redirect to first available, or overview if none
            setTab((firstAvailable?.value || 'overview') as AssetTabType)
        }
    }, [dashboardData.availableAssetTypes, filters.tab, dashboardData.isLoading, setTab])

    // Event handlers
    const handleHoldingCompanyClick = useCallback(
        (holdingCompany: string) => {
            setHoldingCompany(holdingCompany)
        },
        [setHoldingCompany]
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

    const handleManagingEntityClick = useCallback(
        (managingEntity: string) => {
            setManagingEntity(managingEntity)
        },
        [setManagingEntity]
    )

    const handleAssetGroupClick = useCallback(
        (assetGroup: string) => {
            setAssetGroup(assetGroup)
        },
        [setAssetGroup]
    )

    const handleRowClick = useCallback((asset: AssetResponse) => {
        setSelectedAsset(asset)
        setIsModalOpen(true)
    }, [])

    const handlePageChange = useCallback((page: number) => {
        setTableParams(prev => ({ ...prev, page }))
    }, [])

    const handlePageSizeChange = useCallback((pageSize: number) => {
        setTableParams(prev => ({ ...prev, pageSize, page: 1 }))
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

    const handleClearFilter = useCallback(
        (filterKey: FilterKey) => {
            // When clearing assetType, also reset tab to overview
            if (filterKey === 'assetType') {
                setFilters({ assetType: null, tab: 'overview' })
            } else {
                setFilters({ [filterKey]: null })
            }
        },
        [setFilters]
    )

    // Check if holding company has an active dashboard
    const isHoldingCompanyActive = ACTIVE_HOLDING_COMPANIES.has(filters.holdingCompany || '')

    // Get holding companies from filters, with fallback to entities for backwards compatibility
    const holdingCompanies =
        (dashboardData.filters?.holding_companies?.length ?? 0) > 0
            ? (dashboardData.filters?.holding_companies ?? [])
            : (dashboardData.filters?.entities ?? [])

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Holding Company Sidebar */}
            <EntitySidebar
                holdingCompanies={holdingCompanies}
                selectedHoldingCompany={filters.holdingCompany}
                onHoldingCompanyChange={setHoldingCompany}
                isLoading={dashboardData.isFiltersLoading}
            />

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <DashboardHeader
                    title="Portfolio Dashboard"
                    subtitle={
                        filters.holdingCompany
                            ? `Viewing: ${filters.holdingCompany}`
                            : 'Consolidated View - All Companies'
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
                            holdingCompanies={holdingCompanies}
                            selectedHoldingCompany={filters.holdingCompany}
                            onHoldingCompanyChange={setHoldingCompany}
                            isLoading={dashboardData.isFiltersLoading}
                        />
                    }
                />

                {isHoldingCompanyActive ? (
                    <>
                        {/* Asset Type Tabs */}
                        <div className="px-6 pt-4">
                            <AssetTypeTabs
                                activeTab={filters.tab}
                                onTabChange={setTab}
                                availableAssetTypes={dashboardData.availableAssetTypes}
                                isLoading={dashboardData.isLoading}
                            />
                        </div>

                        {/* Active Filters */}
                        <ActiveFilters
                            filters={filters}
                            onClearFilter={handleClearFilter}
                            onClearAll={clearFilters}
                        />

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

                            {/* Charts Grid - 2x2 */}
                            <div className="grid gap-6 lg:grid-cols-2">
                                <EntityDonutChart
                                    data={dashboardData.byHoldingCompany}
                                    currency={filters.currency}
                                    isLoading={dashboardData.isChartsLoading}
                                    isFetching={dashboardData.isFetching}
                                    onEntityClick={handleHoldingCompanyClick}
                                />
                                <AssetTypeDonutChart
                                    data={dashboardData.byAssetType}
                                    currency={filters.currency}
                                    isLoading={dashboardData.isChartsLoading}
                                    isFetching={dashboardData.isFetching}
                                    onAssetTypeClick={handleAssetTypeClick}
                                />
                                <DistributionDonutChart
                                    title="Distribution by Managing Entity"
                                    description="Portfolio allocation by managing entity"
                                    icon={Layers}
                                    data={dashboardData.byManagingEntity}
                                    currency={filters.currency}
                                    isLoading={dashboardData.isChartsLoading}
                                    isFetching={dashboardData.isFetching}
                                    onClick={handleManagingEntityClick}
                                />
                                <DistributionDonutChart
                                    title="Distribution by Asset Group"
                                    description="Portfolio allocation by asset group"
                                    icon={Target}
                                    data={dashboardData.byAssetGroup}
                                    currency={filters.currency}
                                    isLoading={dashboardData.isChartsLoading}
                                    isFetching={dashboardData.isFetching}
                                    onClick={handleAssetGroupClick}
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
                                currency={filters.currency}
                                isLoading={dashboardData.isChartsLoading}
                                isFetching={dashboardData.isFetching}
                                onRowClick={handleAssetTypeClick}
                                selectedAssetType={filters.assetType}
                            />

                            {/* Detailed Data Table */}
                            <DetailedDataTable
                                data={tableData.data}
                                summary={dashboardData.summary}
                                isLoading={tableData.isLoading}
                                isFetching={tableData.isFetching}
                                currency={filters.currency}
                                onRowClick={handleRowClick}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
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
                    <WorkInProgressPlaceholder entityName={filters.holdingCompany || 'Unknown'} />
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
