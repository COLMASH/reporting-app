import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../baseQuery'
import type {
    FileResponse,
    FileListResponse,
    FileListParams,
    UploadFileRequest,
    UploadFileResponse,
    SignedUrlResponse,
    FileDownloadUrlParams
} from './filesApi.types'

export const filesApi = createApi({
    reducerPath: 'filesApi',
    baseQuery: createBaseQuery(),
    tagTypes: ['File'],
    endpoints: builder => ({
        getFiles: builder.query<FileListResponse, FileListParams | void>({
            query: params => {
                const searchParams = new URLSearchParams()
                if (params?.page) {
                    searchParams.append('page', params.page.toString())
                }
                if (params?.pageSize) {
                    searchParams.append('page_size', params.pageSize.toString())
                }
                const queryString = searchParams.toString()
                return `/api/v1/files${queryString ? `?${queryString}` : ''}`
            },
            providesTags: ['File']
        }),
        getFileDetails: builder.query<FileResponse, string>({
            query: fileId => `/api/v1/files/${fileId}`,
            providesTags: (_result, _error, fileId) => [{ type: 'File', id: fileId }]
        }),
        uploadFile: builder.mutation<UploadFileResponse, UploadFileRequest>({
            query: ({ file, companyName, dataClassification }) => {
                const formData = new FormData()
                formData.append('file', file)

                const params = new URLSearchParams()
                params.append('company_name', companyName)
                if (dataClassification) {
                    params.append('data_classification', dataClassification)
                }

                return {
                    url: `/api/v1/files/upload?${params.toString()}`,
                    method: 'POST',
                    body: formData
                }
            },
            invalidatesTags: ['File']
        }),
        deleteFile: builder.mutation<void, string>({
            query: fileId => ({
                url: `/api/v1/files/${fileId}`,
                method: 'DELETE'
            }),
            invalidatesTags: ['File']
        }),
        getFileDownloadUrl: builder.query<SignedUrlResponse, FileDownloadUrlParams>({
            query: ({ fileId, expiresIn }) => {
                const params = new URLSearchParams()
                if (expiresIn) {
                    params.append('expires_in', expiresIn.toString())
                }
                const queryString = params.toString()
                return `/api/v1/files/${fileId}/download-url${queryString ? `?${queryString}` : ''}`
            },
            providesTags: (_result, _error, { fileId }) => [{ type: 'File', id: fileId }]
        })
    })
})

export const {
    useGetFilesQuery,
    useGetFileDetailsQuery,
    useUploadFileMutation,
    useDeleteFileMutation,
    useLazyGetFileDownloadUrlQuery
} = filesApi
