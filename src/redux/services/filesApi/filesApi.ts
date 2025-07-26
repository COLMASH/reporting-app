import { createApi } from '@reduxjs/toolkit/query/react'
import { createBaseQuery } from '../baseQuery'
import type {
    FileResponse,
    FileListResponse,
    UploadFileRequest,
    UploadFileResponse
} from './filesApi.types'

export const filesApi = createApi({
    reducerPath: 'filesApi',
    baseQuery: createBaseQuery(),
    tagTypes: ['File'],
    endpoints: builder => ({
        getFiles: builder.query<FileListResponse, void>({
            query: () => '/api/v1/files/',
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
        })
    })
})

export const {
    useGetFilesQuery,
    useGetFileDetailsQuery,
    useUploadFileMutation,
    useDeleteFileMutation
} = filesApi
