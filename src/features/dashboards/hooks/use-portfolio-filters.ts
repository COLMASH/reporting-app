'use client'

/**
 * Hook for managing portfolio dashboard filters with URL state synchronization.
 * Provides shareable URLs with filter parameters.
 */

import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export type AssetTabType =
    | 'overview'
    | 'equities'
    | 'bonds'
    | 'structured-notes'
    | 'real-estate'
    | 'alternatives'
    | 'commodities'
    | 'crypto'
    | 'cash'

export type CurrencyType = 'USD' | 'EUR'

export interface PortfolioFilters {
    holdingCompany: string | null
    assetType: string | null
    assetSubtype: string | null
    managingEntity: string | null
    assetGroup: string | null
    geographicFocus: string | null
    reportDate: string | null
    tab: AssetTabType
    currency: CurrencyType
}

export interface PortfolioFiltersHook {
    filters: PortfolioFilters
    setHoldingCompany: (holdingCompany: string | null) => void
    setAssetType: (assetType: string | null) => void
    setAssetSubtype: (assetSubtype: string | null) => void
    setManagingEntity: (managingEntity: string | null) => void
    setAssetGroup: (assetGroup: string | null) => void
    setGeographicFocus: (geographicFocus: string | null) => void
    setReportDate: (reportDate: string | null) => void
    setTab: (tab: AssetTabType) => void
    setCurrency: (currency: CurrencyType) => void
    setFilters: (newFilters: Partial<PortfolioFilters>) => void
    clearFilters: () => void
    queryParams: Record<string, string | undefined>
    hasActiveFilters: boolean
}

const VALID_TABS: AssetTabType[] = [
    'overview',
    'equities',
    'bonds',
    'structured-notes',
    'real-estate',
    'alternatives',
    'commodities',
    'crypto',
    'cash'
]

const VALID_CURRENCIES: CurrencyType[] = ['USD', 'EUR']

const isValidTab = (value: string | null): value is AssetTabType => {
    return value !== null && VALID_TABS.includes(value as AssetTabType)
}

const isValidCurrency = (value: string | null): value is CurrencyType => {
    return value !== null && VALID_CURRENCIES.includes(value as CurrencyType)
}

export const usePortfolioFilters = (): PortfolioFiltersHook => {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const router = useRouter()

    // Parse current filters from URL
    const filters: PortfolioFilters = useMemo(() => {
        const tabParam = searchParams.get('tab')
        const currencyParam = searchParams.get('currency')
        return {
            holdingCompany: searchParams.get('holding_company'),
            assetType: searchParams.get('asset_type'),
            assetSubtype: searchParams.get('asset_subtype'),
            managingEntity: searchParams.get('managing_entity'),
            assetGroup: searchParams.get('asset_group'),
            geographicFocus: searchParams.get('geographic_focus'),
            reportDate: searchParams.get('report_date'),
            tab: isValidTab(tabParam) ? tabParam : 'overview',
            currency: isValidCurrency(currencyParam) ? currencyParam : 'USD'
        }
    }, [searchParams])

    // Update URL without full navigation (shallow update)
    const updateUrl = useCallback(
        (newFilters: Partial<PortfolioFilters>) => {
            const params = new URLSearchParams(searchParams.toString())

            // Map filter keys to URL param names
            const paramMapping: Record<string, string> = {
                holdingCompany: 'holding_company',
                assetType: 'asset_type',
                assetSubtype: 'asset_subtype',
                managingEntity: 'managing_entity',
                assetGroup: 'asset_group',
                geographicFocus: 'geographic_focus',
                reportDate: 'report_date',
                tab: 'tab',
                currency: 'currency'
            }

            Object.entries(newFilters).forEach(([key, value]) => {
                const paramKey = paramMapping[key] || key

                if (value === null || value === undefined || value === '') {
                    params.delete(paramKey)
                } else {
                    params.set(paramKey, value)
                }
            })

            const queryString = params.toString()
            const url = queryString ? `${pathname}?${queryString}` : pathname

            router.replace(url, { scroll: false })
        },
        [pathname, router, searchParams]
    )

    // Individual setters
    const setHoldingCompany = useCallback(
        (holdingCompany: string | null) => updateUrl({ holdingCompany }),
        [updateUrl]
    )

    const setAssetType = useCallback(
        (assetType: string | null) => updateUrl({ assetType }),
        [updateUrl]
    )

    const setAssetSubtype = useCallback(
        (assetSubtype: string | null) => updateUrl({ assetSubtype }),
        [updateUrl]
    )

    const setManagingEntity = useCallback(
        (managingEntity: string | null) => updateUrl({ managingEntity }),
        [updateUrl]
    )

    const setAssetGroup = useCallback(
        (assetGroup: string | null) => updateUrl({ assetGroup }),
        [updateUrl]
    )

    const setGeographicFocus = useCallback(
        (geographicFocus: string | null) => updateUrl({ geographicFocus }),
        [updateUrl]
    )

    const setReportDate = useCallback(
        (reportDate: string | null) => updateUrl({ reportDate }),
        [updateUrl]
    )

    const setTab = useCallback((tab: AssetTabType) => updateUrl({ tab }), [updateUrl])

    const setCurrency = useCallback(
        (currency: CurrencyType) => updateUrl({ currency }),
        [updateUrl]
    )

    // Batch setter
    const setFilters = useCallback(
        (newFilters: Partial<PortfolioFilters>) => updateUrl(newFilters),
        [updateUrl]
    )

    // Clear all filters
    const clearFilters = useCallback(() => {
        router.replace(pathname, { scroll: false })
    }, [pathname, router])

    // Build params object for RTK Query (convert to snake_case)
    const queryParams = useMemo(() => {
        const params: Record<string, string | undefined> = {}
        if (filters.holdingCompany) params.holding_company = filters.holdingCompany
        if (filters.assetType) params.asset_type = filters.assetType
        if (filters.assetSubtype) params.asset_subtype = filters.assetSubtype
        if (filters.managingEntity) params.managing_entity = filters.managingEntity
        if (filters.assetGroup) params.asset_group = filters.assetGroup
        if (filters.geographicFocus) params.geographic_focus = filters.geographicFocus
        if (filters.reportDate) params.report_date = filters.reportDate
        return params
    }, [filters])

    const hasActiveFilters = Boolean(
        filters.holdingCompany ||
            filters.assetType ||
            filters.assetSubtype ||
            filters.managingEntity ||
            filters.assetGroup ||
            filters.geographicFocus ||
            filters.reportDate
    )

    return {
        filters,
        setHoldingCompany,
        setAssetType,
        setAssetSubtype,
        setManagingEntity,
        setAssetGroup,
        setGeographicFocus,
        setReportDate,
        setTab,
        setCurrency,
        setFilters,
        clearFilters,
        queryParams,
        hasActiveFilters
    }
}
