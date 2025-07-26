export type AnalysisStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export interface AnalysisCreateRequest {
    file_id: string
    parameters?: {
        focus?: string
        [key: string]: unknown
    }
}

export interface AnalysisResponse {
    id: string
    file_id: string
    agent_version: string
    parameters?: {
        focus?: string
        [key: string]: unknown
    }
    status: AnalysisStatus
    error_message?: string
    tokens_used?: number
    input_tokens?: number
    output_tokens?: number
    processing_time_seconds?: number
    created_at: string
    started_at?: string
    completed_at?: string
}

export interface AnalysisListResponse {
    analyses: AnalysisResponse[]
    total: number
}
