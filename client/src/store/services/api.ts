import { createApi } from '@reduxjs/toolkit/query/react'
// Normally, `fetchBaseQuery` can be exported from '@reduxjs/toolkit/query/react'
// but it must be exported from this package path for Parcel's production
// bundle. See https://github.com/reduxjs/redux-toolkit/issues/3533.
// This may be a Parcel issue, filed here:
// https://github.com/parcel-bundler/parcel/issues/7622#issuecomment-1027569976
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import type { UserProfile } from '../../types'

export const streetmixApi = createApi({
  reducerPath: 'streetmixApi',
  baseQuery: fetchBaseQuery({
    // Only uses the API endpoints, not the service endpoints for now.
    // Need to construct the API with absolute URL (not relative) for
    // mock-service-worker. See:
    // https://github.com/mswjs/msw/issues/1794#issuecomment-1803643227
    baseUrl: new URL('/api/v1', location.origin).href
  }),
  endpoints: (builder) => ({
    getUser: builder.query<UserProfile, string | null>({
      queryFn: (userId, _api, _extraOptions, baseQuery) => {
        if (userId === null) {
          return { data: null }
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
