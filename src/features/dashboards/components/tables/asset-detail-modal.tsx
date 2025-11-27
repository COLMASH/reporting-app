'use client'

/**
 * Modal dialog showing detailed information for a single asset.
 * Displays financial metrics, dates, and classification info.
 */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
    formatCurrency,
    formatPercentageWithSign,
    formatDate,
    getPerformanceColorClass
} from '@/redux/services/portfolioApi'
import { cn } from '@/lib/utils'
import type { AssetResponse } from '@/redux/services/portfolioApi'

export interface AssetDetailModalProps {
    asset: AssetResponse | null
    open: boolean
    onOpenChange: (open: boolean) => void
    isLoading?: boolean
}

interface DetailRowProps {
    label: string
    value: React.ReactNode
    className?: string
}

const DetailRow = ({ label, value, className }: DetailRowProps) => (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <span className="text-muted-foreground shrink-0 text-sm">{label}</span>
        <span className={cn('text-sm font-medium break-words sm:text-right', className)}>
            {value || 'N/A'}
        </span>
    </div>
)

const DetailSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-1">
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        <div className="divide-border/50 divide-y">{children}</div>
    </div>
)

const LoadingSkeleton = () => (
    <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
            ))}
        </div>
    </div>
)

export const AssetDetailModal = ({
    asset,
    open,
    onOpenChange,
    isLoading = false
}: AssetDetailModalProps) => {
    if (!asset && !isLoading) return null

    const returnPct =
        asset?.paid_in_capital_usd && asset.paid_in_capital_usd > 0
            ? (asset.total_asset_return_usd || 0) / asset.paid_in_capital_usd
            : null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[550px]">
                {isLoading ? (
                    <LoadingSkeleton />
                ) : asset ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="pr-8 leading-tight">
                                {asset.asset_name}
                            </DialogTitle>
                            <DialogDescription asChild>
                                <div className="text-muted-foreground flex flex-wrap items-center gap-2 pt-1 text-sm">
                                    <Badge variant="outline">{asset.asset_type}</Badge>
                                    <span className="text-muted-foreground">•</span>
                                    <span>{asset.ownership_holding_entity}</span>
                                    {asset.display_id && (
                                        <>
                                            <span className="text-muted-foreground">•</span>
                                            <span>ID: {asset.display_id}</span>
                                        </>
                                    )}
                                </div>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="mt-4 space-y-6">
                            {/* Classification */}
                            <DetailSection title="Classification">
                                <DetailRow label="Asset Group" value={asset.asset_group || 'N/A'} />
                                <DetailRow
                                    label="Strategy"
                                    value={asset.asset_group_strategy || 'N/A'}
                                />
                                <DetailRow label="Subtype" value={asset.asset_subtype || 'N/A'} />
                                <DetailRow label="Status" value={asset.asset_status || 'N/A'} />
                                <DetailRow
                                    label="Geographic Focus"
                                    value={asset.geographic_focus || 'N/A'}
                                />
                                <DetailRow
                                    label="Currency"
                                    value={asset.denomination_currency || 'N/A'}
                                />
                                <DetailRow
                                    label="Broker/Manager"
                                    value={asset.broker_asset_manager || 'N/A'}
                                />
                            </DetailSection>

                            <Separator />

                            {/* Financials - USD */}
                            <DetailSection title="Financials (USD)">
                                <DetailRow
                                    label="Estimated Value"
                                    value={formatCurrency(asset.estimated_asset_value_usd)}
                                />
                                <DetailRow
                                    label="Cost Basis"
                                    value={formatCurrency(asset.paid_in_capital_usd)}
                                />
                                <DetailRow
                                    label="Total Return"
                                    value={formatCurrency(asset.total_asset_return_usd)}
                                    className={getPerformanceColorClass(returnPct)}
                                />
                                <DetailRow
                                    label="Return %"
                                    value={formatPercentageWithSign(returnPct)}
                                    className={getPerformanceColorClass(returnPct)}
                                />
                                <DetailRow
                                    label="Unfunded Commitment"
                                    value={formatCurrency(asset.unfunded_commitment_usd)}
                                />
                                <DetailRow
                                    label="Total Commitment"
                                    value={formatCurrency(asset.total_investment_commitment_usd)}
                                />
                            </DetailSection>

                            <Separator />

                            {/* Financials - EUR */}
                            <DetailSection title="Financials (EUR)">
                                <DetailRow
                                    label="Estimated Value"
                                    value={formatCurrency(asset.estimated_asset_value_eur, 'EUR')}
                                />
                                <DetailRow
                                    label="Cost Basis"
                                    value={formatCurrency(asset.paid_in_capital_eur, 'EUR')}
                                />
                                <DetailRow
                                    label="Unfunded Commitment"
                                    value={formatCurrency(asset.unfunded_commitment_eur, 'EUR')}
                                />
                            </DetailSection>

                            <Separator />

                            {/* Shares & Pricing */}
                            {(asset.number_of_shares || asset.current_share_price) && (
                                <>
                                    <DetailSection title="Shares & Pricing">
                                        <DetailRow
                                            label="Number of Shares"
                                            value={
                                                asset.number_of_shares
                                                    ? asset.number_of_shares.toLocaleString()
                                                    : 'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Current Price"
                                            value={formatCurrency(asset.current_share_price)}
                                        />
                                        <DetailRow
                                            label="Avg Purchase Price"
                                            value={formatCurrency(
                                                asset.avg_purchase_price_base_currency
                                            )}
                                        />
                                    </DetailSection>
                                    <Separator />
                                </>
                            )}

                            {/* Dates */}
                            <DetailSection title="Key Dates">
                                <DetailRow
                                    label="Report Date"
                                    value={formatDate(asset.report_date)}
                                />
                                <DetailRow
                                    label="Initial Investment"
                                    value={formatDate(asset.initial_investment_date)}
                                />
                                <DetailRow
                                    label="Last Updated"
                                    value={formatDate(asset.updated_at)}
                                />
                            </DetailSection>

                            {/* Structured Note Extension */}
                            {asset.structured_note && (
                                <>
                                    <Separator />
                                    <DetailSection title="Structured Note Details">
                                        <DetailRow
                                            label="Annual Coupon"
                                            value={formatPercentageWithSign(
                                                asset.structured_note.annual_coupon
                                                    ? asset.structured_note.annual_coupon / 100
                                                    : null
                                            )}
                                        />
                                        <DetailRow
                                            label="Payment Frequency"
                                            value={
                                                asset.structured_note.coupon_payment_frequency ||
                                                'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Underlying Index"
                                            value={
                                                asset.structured_note.underlying_index_name || 'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Strike Level"
                                            value={
                                                asset.structured_note.strike_level
                                                    ? asset.structured_note.strike_level.toLocaleString()
                                                    : 'N/A'
                                            }
                                        />
                                        <DetailRow
                                            label="Capital Protection"
                                            value={formatPercentageWithSign(
                                                asset.structured_note.capital_protection
                                                    ? asset.structured_note.capital_protection / 100
                                                    : null
                                            )}
                                        />
                                        <DetailRow
                                            label="Final Due Date"
                                            value={formatDate(asset.structured_note.final_due_date)}
                                        />
                                    </DetailSection>
                                </>
                            )}

                            {/* Real Estate Extension */}
                            {asset.real_estate && (
                                <>
                                    <Separator />
                                    <DetailSection title="Real Estate Details">
                                        <DetailRow
                                            label="Original Cost"
                                            value={formatCurrency(
                                                asset.real_estate.cost_original_asset
                                            )}
                                        />
                                        <DetailRow
                                            label="Capex Budget"
                                            value={formatCurrency(
                                                asset.real_estate.estimated_capex_budget
                                            )}
                                        />
                                        <DetailRow
                                            label="Total Cost Estimate"
                                            value={formatCurrency(
                                                asset.real_estate.estimated_total_cost
                                            )}
                                        />
                                        <DetailRow
                                            label="Capex Invested"
                                            value={formatCurrency(asset.real_estate.capex_invested)}
                                        />
                                        <DetailRow
                                            label="Equity Investment"
                                            value={formatCurrency(
                                                asset.real_estate.equity_investment_to_date
                                            )}
                                        />
                                        <DetailRow
                                            label="Estimated Capital Gain"
                                            value={formatCurrency(
                                                asset.real_estate.estimated_capital_gain
                                            )}
                                            className={getPerformanceColorClass(
                                                asset.real_estate.estimated_capital_gain
                                            )}
                                        />
                                    </DetailSection>
                                </>
                            )}
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    )
}
