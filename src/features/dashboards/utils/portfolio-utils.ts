import {
    PortfolioAsset,
    AssetAllocation,
    PerformanceMetrics,
    AssetTypeMetrics,
    AssetType
} from '../types/portfolio'

// Map individual asset types to main dashboard categories
export const assetTypeToCategory = (assetType: string): string => {
    const categoryMap: Record<string, string> = {
        // Structured Notes & Fixed Income
        'Structured notes': 'Structured Notes',
        Bonds: 'Structured Notes',
        'Cash and Money Market Funds': 'Structured Notes',

        // Equities
        Equities: 'Equities',

        // Alternative Investments
        'Private Equity Fund': 'Alternative Investments',
        'Private Equity direct ownership': 'Alternative Investments',
        'Private Debt': 'Alternative Investments',
        'Venture Capital Fund': 'Alternative Investments',
        'Venture Capital startup': 'Alternative Investments',
        'Venture Capital & Crypto Assets Fund': 'Alternative Investments',
        'Fund of Funds': 'Alternative Investments',
        'Fund of Search Funds': 'Alternative Investments',
        'Search Fund': 'Alternative Investments',
        'Housing development': 'Alternative Investments',
        Redevelopment: 'Alternative Investments',
        'Real Estate': 'Alternative Investments',
        'Hedge Funds': 'Alternative Investments',

        // Commodities
        Gold: 'Commodities',
        Silver: 'Commodities',
        BTC: 'Commodities'
    }

    return categoryMap[assetType] || assetType
}

export const parseNumericValue = (value: string | number | undefined): number => {
    if (value === undefined || value === null || value === '' || value === '-') return 0

    const stringValue = String(value)
    const cleanedValue = stringValue.replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(cleanedValue)

    if (stringValue.includes('%')) {
        return parsed / 100
    }

    return isNaN(parsed) ? 0 : parsed
}

export const formatCurrency = (
    value: number,
    currency: string = 'EUR',
    compact = false
): string => {
    if (compact) {
        const absValue = Math.abs(value)
        const sign = value < 0 ? '-' : ''
        const currencySymbol =
            currency === 'EUR' ? '€' : currency === 'USD' ? '$' : currency === 'GBP' ? '£' : ''

        if (absValue >= 1e9) {
            return `${sign}${currencySymbol}${(absValue / 1e9).toFixed(2)}B`
        } else if (absValue >= 1e6) {
            return `${sign}${currencySymbol}${(absValue / 1e6).toFixed(2)}M`
        } else if (absValue >= 1e3) {
            return `${sign}${currencySymbol}${(absValue / 1e3).toFixed(1)}K`
        }
        return `${sign}${currencySymbol}${absValue.toFixed(0)}`
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value)
}

export const formatPercentage = (value: number, showSign = false): string => {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        signDisplay: showSign ? 'always' : 'auto'
    }).format(value)
    return formatted
}

export const formatNumber = (value: number, decimals = 0): string => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(value)
}

export const getPerformanceTrend = (value: number): 'positive' | 'negative' | 'neutral' => {
    if (value > 0) return 'positive'
    if (value < 0) return 'negative'
    return 'neutral'
}

export const calculateTotalPortfolioValue = (assets: PortfolioAsset[]): number => {
    return assets.reduce((total, asset) => {
        const value = parseNumericValue(asset['Estimated asset value to date'])
        return total + value
    }, 0)
}

export const calculateTotalPortfolioCost = (assets: PortfolioAsset[]): number => {
    return assets.reduce((total, asset) => {
        const cost = parseNumericValue(
            asset['Total equity investment in asset (at cost) / Paid-in Capital']
        )
        return total + cost
    }, 0)
}

export const calculatePortfolioReturn = (assets: PortfolioAsset[]): PerformanceMetrics => {
    const totalValue = calculateTotalPortfolioValue(assets)
    const totalCost = calculateTotalPortfolioCost(assets)

    const totalReturn = totalValue - totalCost
    const returnPercentage = totalCost > 0 ? totalReturn / totalCost : 0

    const assetReturns = assets
        .map(asset => parseNumericValue(asset['Total asset return to date']))
        .filter(r => r !== 0)

    const averageReturn =
        assetReturns.length > 0
            ? assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length
            : 0

    return {
        totalValue,
        totalCost,
        totalReturn,
        returnPercentage,
        averageReturn
    }
}

export const getAssetAllocation = (assets: PortfolioAsset[]): AssetAllocation[] => {
    const totalValue = calculateTotalPortfolioValue(assets)
    const allocationMap = new Map<AssetType, { value: number; count: number }>()

    assets.forEach(asset => {
        const type = asset['Asset type'] as AssetType
        const value = parseNumericValue(asset['Estimated asset value to date'])

        if (!allocationMap.has(type)) {
            allocationMap.set(type, { value: 0, count: 0 })
        }

        const current = allocationMap.get(type)!
        current.value += value
        current.count += 1
    })

    return Array.from(allocationMap.entries())
        .map(([assetType, data]) => ({
            assetType,
            value: data.value,
            percentage: totalValue > 0 ? data.value / totalValue : 0,
            count: data.count
        }))
        .sort((a, b) => b.value - a.value)
}

// Get asset allocation grouped by main categories
export const getGroupedAssetAllocation = (assets: PortfolioAsset[]): AssetAllocation[] => {
    const totalValue = calculateTotalPortfolioValue(assets)
    const allocationMap = new Map<string, { value: number; count: number }>()

    assets.forEach(asset => {
        const category = assetTypeToCategory(asset['Asset type'])
        const value = parseNumericValue(asset['Estimated asset value to date'])

        if (!allocationMap.has(category)) {
            allocationMap.set(category, { value: 0, count: 0 })
        }

        const current = allocationMap.get(category)!
        current.value += value
        current.count += 1
    })

    return Array.from(allocationMap.entries())
        .map(([category, data]) => ({
            assetType: category as AssetType,
            value: data.value,
            percentage: totalValue > 0 ? data.value / totalValue : 0,
            count: data.count
        }))
        .sort((a, b) => b.value - a.value)
}

export const getAssetsByType = (assets: PortfolioAsset[], type: AssetType): PortfolioAsset[] => {
    return assets.filter(asset => asset['Asset type'] === type)
}

export const getAssetTypeMetrics = (assets: PortfolioAsset[]): AssetTypeMetrics[] => {
    const assetTypes = Array.from(new Set(assets.map(a => a['Asset type'] as AssetType)))

    return assetTypes
        .map(type => {
            const typeAssets = getAssetsByType(assets, type)
            const metrics = calculatePortfolioReturn(typeAssets)

            return {
                type,
                totalValue: metrics.totalValue,
                totalCost: metrics.totalCost,
                totalReturn: metrics.totalReturn,
                returnPercentage: metrics.returnPercentage,
                assetCount: typeAssets.length,
                averageReturn: metrics.averageReturn
            }
        })
        .sort((a, b) => b.totalValue - a.totalValue)
}

// Get metrics grouped by main categories
export const getGroupedAssetTypeMetrics = (assets: PortfolioAsset[]): AssetTypeMetrics[] => {
    const categoryMap = new Map<string, PortfolioAsset[]>()

    // Group assets by category
    assets.forEach(asset => {
        const category = assetTypeToCategory(asset['Asset type'])
        if (!categoryMap.has(category)) {
            categoryMap.set(category, [])
        }
        categoryMap.get(category)!.push(asset)
    })

    // Calculate metrics for each category
    return Array.from(categoryMap.entries())
        .map(([category, categoryAssets]) => {
            const metrics = calculatePortfolioReturn(categoryAssets)
            return {
                type: category as AssetType,
                totalValue: metrics.totalValue,
                totalCost: metrics.totalCost,
                totalReturn: metrics.totalReturn,
                returnPercentage: metrics.returnPercentage,
                assetCount: categoryAssets.length,
                averageReturn: metrics.averageReturn
            }
        })
        .sort((a, b) => b.totalValue - a.totalValue)
}

export const getTopPerformers = (
    assets: PortfolioAsset[],
    limit: number = 10
): PortfolioAsset[] => {
    return [...assets]
        .sort((a, b) => {
            const returnA = parseNumericValue(a['Total asset return to date'])
            const returnB = parseNumericValue(b['Total asset return to date'])
            return returnB - returnA
        })
        .slice(0, limit)
}

export const getBottomPerformers = (
    assets: PortfolioAsset[],
    limit: number = 10
): PortfolioAsset[] => {
    return [...assets]
        .sort((a, b) => {
            const returnA = parseNumericValue(a['Total asset return to date'])
            const returnB = parseNumericValue(b['Total asset return to date'])
            return returnA - returnB
        })
        .slice(0, limit)
}

export const getAssetsByBroker = (assets: PortfolioAsset[]): Map<string, PortfolioAsset[]> => {
    const brokerMap = new Map<string, PortfolioAsset[]>()

    assets.forEach(asset => {
        const originalBroker = asset['Broker / Asset Manager']
        // Normalize broker name: trim and convert to lowercase for comparison
        const normalizedBroker = originalBroker.trim().toLowerCase()

        // Find if we already have this broker (case-insensitive)
        let existingKey: string | undefined
        for (const [key] of brokerMap.entries()) {
            if (key.trim().toLowerCase() === normalizedBroker) {
                existingKey = key
                break
            }
        }

        if (existingKey) {
            // Use existing broker name to maintain consistency
            brokerMap.get(existingKey)!.push(asset)
        } else {
            // Use the first occurrence's formatting
            brokerMap.set(originalBroker, [asset])
        }
    })

    return brokerMap
}

export const getCurrencyDistribution = (assets: PortfolioAsset[]): Map<string, number> => {
    const currencyMap = new Map<string, number>()

    assets.forEach(asset => {
        const currency = asset['Denomination currency of asset and cashflow']
        const value = parseNumericValue(asset['Estimated asset value to date'])

        if (!currencyMap.has(currency)) {
            currencyMap.set(currency, 0)
        }
        currencyMap.set(currency, currencyMap.get(currency)! + value)
    })

    return currencyMap
}

export const getRiskMetrics = (assets: PortfolioAsset[]) => {
    const activeAssets = assets.filter(a => a['Asset status'] === 'Active in portfolio')
    const leveragedAssets = assets.filter(a => parseNumericValue(a['Asset-level financing']) > 0)
    const pendingInvestments = assets.reduce(
        (sum, a) => sum + parseNumericValue(a['Pending investment / Unfunded Commitment']),
        0
    )

    return {
        activeAssetsCount: activeAssets.length,
        totalAssetsCount: assets.length,
        leveragedAssetsCount: leveragedAssets.length,
        totalLeverage: leveragedAssets.reduce(
            (sum, a) => sum + parseNumericValue(a['Asset-level financing']),
            0
        ),
        pendingInvestments,
        diversificationScore: calculateDiversificationScore(assets)
    }
}

const calculateDiversificationScore = (assets: PortfolioAsset[]): number => {
    const allocation = getAssetAllocation(assets)
    const herfindahlIndex = allocation.reduce((sum, a) => sum + Math.pow(a.percentage, 2), 0)
    return Math.max(0, 1 - herfindahlIndex)
}
