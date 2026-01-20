/**
 * TypeScript types for Portfolio API service.
 * Matches backend Pydantic schemas in reporting-back/src/modules/portfolio/schemas.py
 */

// ============================================================
// ENUMS
// ============================================================

export type GroupByField =
    | 'ownership_holding_entity'
    | 'holding_company'
    | 'managing_entity'
    | 'asset_type'
    | 'asset_subtype'
    | 'asset_group'
    | 'geographic_focus'
    | 'denomination_currency'
    | 'asset_status'
    | 'broker_asset_manager'

export type SortOrder = 'asc' | 'desc'

// ============================================================
// REQUEST PARAMETER TYPES
// ============================================================

export interface PortfolioAssetsParams {
    holding_company?: string
    asset_type?: string
    asset_subtype?: string
    managing_entity?: string
    asset_group?: string
    geographic_focus?: string
    report_date?: string
    search?: string
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: SortOrder
    include_extension?: boolean
}

export interface AggregationParams {
    holding_company?: string
    asset_type?: string
    asset_subtype?: string
    managing_entity?: string
    asset_group?: string
    geographic_focus?: string
    report_date?: string
}

export interface FlexibleAggregationParams extends AggregationParams {
    group_by: GroupByField
}

export interface HistoricalNavParams {
    holding_company?: string
    asset_type?: string
    asset_subtype?: string
    geographic_focus?: string
    start_date?: string
    end_date?: string
    group_by?: 'holding_company' | 'ownership_holding_entity'
}

// ============================================================
// EXTENSION RESPONSE TYPES
// ============================================================

export interface StructuredNoteResponse {
    annual_coupon: number | null
    coupon_payment_frequency: string | null
    next_coupon_review_date: string | null
    next_principal_review_date: string | null
    final_due_date: string | null
    redemption_type: string | null
    underlying_index_name: string | null
    underlying_index_code: string | null
    strike_level: number | null
    underlying_index_level: number | null
    performance_vs_strike: number | null
    effective_strike_percentage: number | null
    note_leverage: string | null
    capital_protection: number | null
    capital_protection_barrier: number | null
    coupon_protection_barrier_pct: number | null
    coupon_protection_barrier_value: number | null
}

export interface RealEstateResponse {
    // Status
    real_estate_status: string | null

    // EUR columns (renamed with _eur suffix)
    cost_original_asset_eur: number | null
    estimated_capex_budget_eur: number | null
    pivert_development_fees_eur: number | null
    estimated_total_cost_eur: number | null
    capex_invested_eur: number | null
    total_investment_to_date_eur: number | null
    equity_investment_to_date_eur: number | null
    pending_equity_investment_eur: number | null
    estimated_capital_gain_eur: number | null

    // USD columns
    estimated_total_cost_usd: number | null
    total_investment_to_date_usd: number | null
    equity_investment_to_date_usd: number | null
    pending_equity_investment_usd: number | null
    estimated_capital_gain_usd: number | null
}

// ============================================================
// CORE RESPONSE TYPES
// ============================================================

export interface FilterOptionsResponse {
    entities: string[]
    holding_companies: string[]
    asset_types: string[]
    report_dates: string[]
}

export interface AssetResponse {
    // Identifiers
    id: string
    display_id: number | null

    // Classification
    holding_company: string | null
    ownership_holding_entity: string
    managing_entity: string
    asset_group: string | null
    asset_type: string
    asset_subtype: string | null
    asset_subtype_2: string | null
    asset_name: string
    asset_identifier: string | null
    asset_status: string | null

    // Location & Manager
    geographic_focus: string | null
    broker_asset_manager: string | null
    denomination_currency: string

    // Dates
    report_date: string | null
    initial_investment_date: string | null

    // Share data
    number_of_shares: number | null
    avg_purchase_price_base_currency: number | null
    current_share_price: number | null

    // FX Rates
    usd_eur_inception: number | null
    usd_eur_current: number | null
    usd_cad_current: number | null
    usd_chf_current: number | null
    usd_hkd_current: number | null

    // Financial - Base Currency
    total_investment_commitment_base_currency: number | null
    paid_in_capital_base_currency: number | null
    asset_level_financing_base_currency: number | null
    unfunded_commitment_base_currency: number | null
    estimated_asset_value_base_currency: number | null
    total_asset_return_base_currency: number | null

    // Financial - USD
    total_investment_commitment_usd: number | null
    paid_in_capital_usd: number | null
    unfunded_commitment_usd: number | null
    estimated_asset_value_usd: number | null
    total_asset_return_usd: number | null
    unrealized_gain_usd: number | null

    // Financial - EUR
    total_investment_commitment_eur: number | null
    paid_in_capital_eur: number | null
    unfunded_commitment_eur: number | null
    estimated_asset_value_eur: number | null
    total_asset_return_eur: number | null
    unrealized_gain_eur: number | null

    // Timestamps
    created_at: string
    updated_at: string | null

    // Extension data (only populated when include_extension=true)
    structured_note: StructuredNoteResponse | null
    real_estate: RealEstateResponse | null
}

export interface AssetListResponse {
    assets: AssetResponse[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

export interface PortfolioSummaryResponse {
    report_date: string | null
    total_assets: number
    total_estimated_value_usd: number
    total_paid_in_capital_usd: number
    total_unfunded_commitment_usd: number
    total_unrealized_gain_usd: number
    total_estimated_value_eur: number
    total_paid_in_capital_eur: number
    total_unfunded_commitment_eur: number
    total_unrealized_gain_eur: number
    total_return_pct: number | null
}

// ============================================================
// AGGREGATION RESPONSE TYPES
// ============================================================

export interface AggregationGroup {
    name: string
    value_usd: number
    value_eur: number
    percentage: number
    count: number
}

export interface EntityAggregationResponse {
    report_date: string | null
    total_value_usd: number
    total_value_eur: number
    groups: AggregationGroup[]
}

export interface AssetTypeGroup {
    asset_type: string
    value_usd: number
    value_eur: number
    percentage: number
    count: number
    paid_in_capital_usd: number
    paid_in_capital_eur: number
    unfunded_commitment_usd: number
    unfunded_commitment_eur: number
    unrealized_gain_usd: number
    unrealized_gain_eur: number
}

export interface AssetTypeAggregationResponse {
    report_date: string | null
    total_value_usd: number
    total_value_eur: number
    groups: AssetTypeGroup[]
}

export interface FlexibleAggregationGroup {
    label: string
    value_usd: number
    value_eur: number
    percentage: number
    count: number
    paid_in_capital_usd: number
    paid_in_capital_eur: number
    unfunded_commitment_usd: number
    unfunded_commitment_eur: number
    unrealized_gain_usd: number
    unrealized_gain_eur: number
    avg_return: number | null
}

export interface FlexibleAggregationResponse {
    report_date: string | null
    group_by: string
    total_value_usd: number
    total_value_eur: number
    total_count: number
    groups: FlexibleAggregationGroup[]
}

// ============================================================
// HISTORICAL NAV RESPONSE TYPES
// ============================================================

export interface NavDataPoint {
    date: string
    value_usd: number
    value_eur: number
}

export interface NavSeries {
    name: string
    data: NavDataPoint[]
}

export interface HistoricalNavResponse {
    series: NavSeries[]
}
