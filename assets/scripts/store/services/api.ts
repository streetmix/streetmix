import { createApi } from '@reduxjs/toolkit/query/react'
// Normally, `fetchBaseQuery` can be exported from '@reduxjs/toolkit/query/react'
// but it must be exported from this package path for Parcel's production
// bundle. See https://github.com/reduxjs/redux-toolkit/issues/3533.
// This may be a Parcel issue, filed here:
// https://github.com/parcel-bundler/parcel/issues/7622#issuecomment-1027569976
import { fetchBaseQuery } from '@reduxjs/toolkit/query'

export const streetmixApi = createApi({
  reducerPath: 'streetmixApi',
  baseQuery: fetchBaseQuery({
    // Only uses the API endpoints, not the service endpoints for now.
    baseUrl: '/api/v1/'
  }),
  endpoints: (builder) => ({
    getUser: builder.query({
      queryFn: (userId: string, _api, _extraOptions, baseQuery) => {
        if (!userId) {
          return { data: {} }
        } else {
          return baseQuery(`users/${userId}`)
        }
      }
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserQuery } = streetmixApi
