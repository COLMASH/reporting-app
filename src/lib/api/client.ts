const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

interface RequestOptions extends RequestInit {
    params?: Record<string, string | number | boolean>
}

class ApiClient {
    private baseURL: string

    constructor(baseURL: string) {
        this.baseURL = baseURL
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const { params, headers, ...fetchOptions } = options

        let url = `${this.baseURL}${endpoint}`

        if (params) {
            const searchParams = new URLSearchParams()
            Object.entries(params).forEach(([key, value]) => {
                searchParams.append(key, String(value))
            })
            url += `?${searchParams.toString()}`
        }

        const response = await fetch(url, {
            ...fetchOptions,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
                errorData.detail || errorData.message || `API Error: ${response.statusText}`
            )
        }

        return response.json()
    }

    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'GET'
        })
    }

    async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        })
    }

    async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        })
    }

    async patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        })
    }

    async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'DELETE'
        })
    }
}

export const apiClient = new ApiClient(API_URL)
