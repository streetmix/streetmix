import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const streetmixApi = createApi({
  reducerPath: 'streetmixApi',
  baseQuery: fetchBaseQuery({
    // Only uses the API endpoints, not the service endpoints for now.
    baseUrl: '/api/v1/'
  }),
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (userId) => `users/${userId}`
    })
  })
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetUserQuery } = streetmixApi
