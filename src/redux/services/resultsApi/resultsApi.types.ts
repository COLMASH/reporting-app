export type ResultType =
    | 'visualization'
    | 'metrics'
    | 'summary'
    | 'data_quality'
    | 'recommendations'

export interface ResultResponse {
    id: string
    analysis_id: string
    result_type: ResultType
    title: string
    description?: string
    insight_text?: string
    insight_data?: Record<string, unknown> | unknown[]
    order_index: number
    created_at: string
}

export interface ResultListResponse {
    results: ResultResponse[]
    total: number
}

export interface GetUserResultsParams {
    result_type?: ResultType
    page?: number
    page_size?: number
}

export interface ResultStatistics {
    total: number
    by_type: Record<ResultType, number>
}
