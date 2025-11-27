'use client'

/**
 * Asset type tab navigation for portfolio dashboard.
 * Horizontal scrollable tabs for filtering by asset type.
 * Supports dynamic availability based on selected entity.
 */

import {
    LayoutDashboard,
    TrendingUp,
    FileText,
    FileStack,
    Building2,
    Rocket,
    Coins,
    Bitcoin,
    Wallet
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { AssetTabType } from '@/features/dashboards/hooks/use-portfolio-filters'

export interface AssetTypeTabsProps {
    activeTab: AssetTabType
    onTabChange: (tab: AssetTabType) => void
    availableAssetTypes?: Set<string>
    isLoading?: boolean
}

interface TabConfig {
    value: AssetTabType
    label: string
    icon: React.ComponentType<{ className?: string }>
}

export const TAB_CONFIG: TabConfig[] = [
    { value: 'overview', label: 'Overview', icon: LayoutDashboard },
    { value: 'equities', label: 'Equities', icon: TrendingUp },
    { value: 'bonds', label: 'Bonds', icon: FileText },
    { value: 'structured-notes', label: 'Structured Notes', icon: FileStack },
    { value: 'real-estate', label: 'Real Estate', icon: Building2 },
    { value: 'alternatives', label: 'Alternatives', icon: Rocket },
    { value: 'commodities', label: 'Commodities', icon: Coins },
    { value: 'crypto', label: 'Crypto', icon: Bitcoin },
    { value: 'cash', label: 'Cash', icon: Wallet }
]

/**
 * Map tab values to API asset_type values (for availability check).
 */
export const TAB_TO_ASSET_TYPE: Record<AssetTabType, string | null> = {
    overview: null,
    equities: 'Equities',
    bonds: 'Bonds',
    'structured-notes': 'Structured notes',
    'real-estate': 'Real Estate',
    alternatives: 'Alternative assets',
    commodities: 'Commodities',
    crypto: 'Cryptocurrency',
    cash: 'Cash and Money Market Funds'
}

/**
 * Check if a tab is available based on the available asset types.
 */
const isTabAvailable = (tab: AssetTabType, availableTypes?: Set<string>): boolean => {
    // Overview is always available
    if (tab === 'overview') return true

    // If no available types provided or empty (loading), show all as available
    if (!availableTypes || availableTypes.size === 0) return true

    const assetType = TAB_TO_ASSET_TYPE[tab]
    return assetType ? availableTypes.has(assetType) : true
}

export const AssetTypeTabs = ({
    activeTab,
    onTabChange,
    availableAssetTypes,
    isLoading = false
}: AssetTypeTabsProps) => {
    // Filter tabs to only show available ones (hide unavailable)
    const visibleTabs = TAB_CONFIG.filter(
        ({ value }) => isLoading || isTabAvailable(value, availableAssetTypes)
    )

    return (
        <Tabs
            value={activeTab}
            onValueChange={value => onTabChange(value as AssetTabType)}
            className="w-full"
        >
            <TabsList className="bg-muted/50 h-auto w-full flex-nowrap justify-start overflow-x-auto p-1">
                {visibleTabs.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                        key={value}
                        value={value}
                        className="data-[state=active]:bg-background flex items-center gap-2 px-4 py-2 whitespace-nowrap"
                    >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                ))}
            </TabsList>
        </Tabs>
    )
}

/**
 * Map asset tab type to API asset_type filter value.
 */
export const getAssetTypeFilter = (tab: AssetTabType): string | null => {
    return TAB_TO_ASSET_TYPE[tab]
}
