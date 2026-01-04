/**
 * Types for the Portfolio Reports API.
 * AI-powered portfolio analysis reports generated asynchronously.
 */

export type ReportStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export type ReportScope = 'single_date' | 'all_dates'

export interface CreateReportRequest {
    title?: string
    scope?: ReportScope
    report_date?: string | null
    entity_filter?: string | null
    asset_type_filter?: string | null
    holding_company_filter?: string | null
    user_prompt?: string | null
    research_enabled?: boolean
}

export interface ReportResponse {
    id: string
    user_id: string
    title: string
    scope: ReportScope
    report_date: string | null
    entity_filter: string | null
    asset_type_filter: string | null
    holding_company_filter: string | null
    user_prompt: string | null
    research_enabled: boolean
    status: ReportStatus
    agent_version: string
    error_message: string | null
    markdown_content: string | null
    tokens_used: number | null
    input_tokens: number | null
    output_tokens: number | null
    processing_time_seconds: number | null
    created_at: string
    started_at: string | null
    completed_at: string | null
}

export interface ReportListResponse {
    reports: ReportResponse[]
    total: number
}

export interface ReportListParams {
    limit?: number
    offset?: number
}
