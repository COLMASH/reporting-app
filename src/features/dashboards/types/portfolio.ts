export interface PortfolioAsset {
    'Ownership holding entity': string
    'Asset group': string
    'Asset sub-group': string
    'Asset type': string
    'Asset name': string
    'Asset ticker symbol, identification code or ISIN': string
    'Asset status': string
    'Broker / Asset Manager': string
    'Denomination currency of asset and cashflow': string
    'Date of intial purchase/investment': string
    'Number of shares or units in the portfolio to date': number
    'Average purchase price per share or unit': string | number
    'Total investment commitment': string | number
    'Total equity investment in asset (at cost) / Paid-in Capital': string | number
    'Asset-level financing': number
    'Pending investment / Unfunded Commitment': number
    'Current price per share or unit': string | number
    'Estimated asset value to date': string | number
    'Total asset return to date': string | number
    'Annual coupon of Structured Note'?: string | number
    'Coupon payment frequency'?: string
    'Next review date for coupon payment'?: string
    'Next review date for principal payment'?: string
    'Final due date of Structured Note'?: string
    'Structured Note underlying index or asset basket - name'?: string
    'Structured Note underlying index or asset basket - identification code'?: string
    'Strike level of underlying index or assets'?: string | number
    'Underlying index or asset level as of 31 May 2025'?: string | number
    'Performance of underlying index or asset vs. Strike level'?: string
    'Effective Strike percentage'?: string
    'Structured Note leverage'?: string
    'Capital protection of Structured Note'?: string
    'Capital protection barrier of Structured Note'?: string | number
    'Coupon protection barrier (%) of Structured Note'?: string
    'Coupon protection barrier of Structured Note'?: string | number
    [key: string]: string | number | undefined
}

export type AssetType =
    | 'Structured notes'
    | 'Cash and Money Market Funds'
    | 'Private Debt'
    | 'Bonds'
    | 'Equities'
    | 'Private Equity Fund'
    | 'Gold'
    | 'Silver'
    | 'BTC'
    | 'Venture Capital startup'
    | 'Fund of Search Funds'
    | 'Search Fund'
    | 'Venture Capital Fund'
    | 'Fund of Funds'
    | 'Venture Capital & Crypto Assets Fund'
    | 'Private Equity direct ownership'
    | 'Housing development'
    | 'Redevelopment'

export interface AssetAllocation {
    assetType: AssetType
    value: number
    percentage: number
    count: number
}

export interface PerformanceMetrics {
    totalValue: number
    totalCost: number
    totalReturn: number
    returnPercentage: number
    averageReturn: number
}

export interface TimeSeriesData {
    date: string
    value: number
}

export interface AssetTypeMetrics {
    type: AssetType
    totalValue: number
    totalCost: number
    totalReturn: number
    returnPercentage: number
    assetCount: number
    averageReturn: number
}
