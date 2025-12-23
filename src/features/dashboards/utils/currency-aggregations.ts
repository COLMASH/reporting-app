/**
 * Type definitions for EUR aggregations.
 * Backend now provides EUR fields on all aggregation endpoints.
 */

export interface EurSummary {
    total_estimated_value_eur: number
    total_paid_in_capital_eur: number
    total_unfunded_commitment_eur: number
    total_unrealized_gain_eur: number
    total_return_amount_eur: number // NAV - Cost
    total_assets: number
    weighted_avg_return: number | null
}
