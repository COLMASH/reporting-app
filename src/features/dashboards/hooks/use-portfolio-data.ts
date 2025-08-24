import { useMemo } from 'react'
import portfolioData from '../mocks/portfolio.json'
import { PortfolioAsset, AssetType } from '../types/portfolio'
import {
    calculatePortfolioReturn,
    getAssetAllocation,
    getGroupedAssetAllocation,
    getAssetsByType,
    getAssetTypeMetrics,
    getGroupedAssetTypeMetrics,
    getTopPerformers,
    getBottomPerformers,
    getAssetsByBroker,
    getCurrencyDistribution,
    getRiskMetrics
} from '../utils/portfolio-utils'

export const usePortfolioData = () => {
    const assets = portfolioData as PortfolioAsset[]

    const portfolioMetrics = useMemo(() => calculatePortfolioReturn(assets), [assets])

    const assetAllocation = useMemo(() => getAssetAllocation(assets), [assets])

    const groupedAssetAllocation = useMemo(() => getGroupedAssetAllocation(assets), [assets])

    const assetTypeMetrics = useMemo(() => getAssetTypeMetrics(assets), [assets])

    const groupedAssetTypeMetrics = useMemo(() => getGroupedAssetTypeMetrics(assets), [assets])

    const topPerformers = useMemo(() => getTopPerformers(assets, 10), [assets])

    const bottomPerformers = useMemo(() => getBottomPerformers(assets, 10), [assets])

    const brokerDistribution = useMemo(() => getAssetsByBroker(assets), [assets])

    const currencyDistribution = useMemo(() => getCurrencyDistribution(assets), [assets])

    const riskMetrics = useMemo(() => getRiskMetrics(assets), [assets])

    const getAssetsByTypeData = (type: AssetType) => {
        return getAssetsByType(assets, type)
    }

    return {
        assets,
        portfolioMetrics,
        assetAllocation,
        groupedAssetAllocation,
        assetTypeMetrics,
        groupedAssetTypeMetrics,
        topPerformers,
        bottomPerformers,
        brokerDistribution,
        currencyDistribution,
        riskMetrics,
        getAssetsByType: getAssetsByTypeData
    }
}
