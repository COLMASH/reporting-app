'use client'

/**
 * Active Filters indicator bar.
 * Shows removable filter chips for active data filters.
 * Hidden when no filters are active.
 */

import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PortfolioFilters } from '../../hooks/use-portfolio-filters'

export type FilterKey =
    | 'holdingCompany'
    | 'assetType'
    | 'managingEntity'
    | 'assetGroup'
    | 'geographicFocus'

export interface ActiveFiltersProps {
    filters: PortfolioFilters
    onClearFilter: (key: FilterKey) => void
    onClearAll: () => void
}

interface FilterConfig {
    key: FilterKey
    label: string
}

const FILTER_CONFIG: FilterConfig[] = [
    { key: 'holdingCompany', label: 'Holding Company' },
    { key: 'assetType', label: 'Asset Type' },
    { key: 'managingEntity', label: 'Managing Entity' },
    { key: 'assetGroup', label: 'Asset Group' },
    { key: 'geographicFocus', label: 'Geographic Focus' }
]

interface FilterChipProps {
    label: string
    value: string
    onRemove: () => void
}

const FilterChip = ({ label, value, onRemove }: FilterChipProps) => (
    <Badge variant="secondary" className="gap-1.5 py-1 pr-1 pl-2.5">
        <span className="max-w-[150px] truncate sm:max-w-none">
            {label}: {value}
        </span>
        <button
            type="button"
            onClick={onRemove}
            className="hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
            aria-label={`Remove ${label} filter`}
        >
            <X className="h-3 w-3" />
        </button>
    </Badge>
)

export const ActiveFilters = ({ filters, onClearFilter, onClearAll }: ActiveFiltersProps) => {
    // Build list of active filters
    const activeFilters = useMemo(() => {
        return FILTER_CONFIG.filter(config => filters[config.key] !== null).map(config => ({
            ...config,
            value: filters[config.key] as string
        }))
    }, [filters])

    // Don't render if no filters active
    if (activeFilters.length === 0) {
        return null
    }

    return (
        <div className="border-b px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-muted-foreground shrink-0 text-sm font-medium">Filters:</span>

                {activeFilters.map(filter => (
                    <FilterChip
                        key={filter.key}
                        label={filter.label}
                        value={filter.value}
                        onRemove={() => onClearFilter(filter.key)}
                    />
                ))}

                {activeFilters.length >= 2 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearAll}
                        className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                        Clear all
                    </Button>
                )}
            </div>
        </div>
    )
}
