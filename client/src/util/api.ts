import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

import {
  type SentimentComment,
  type SentimentVote,
  type UserProfile,
  type UserSettingsData,
} from '../types'

import type {
  GalleryAPIResponse,
  GalleryPaginatedAPIResponse,
  GeoIpAPIResponse,
  StreetAPIPayload,
  StreetAPIResponse,
  TranslationAPIResponse,
} from '@streetmix/types'

const MAX_API_RETRY = 3
const BASE_URL_API_V1 = '/api/v1'
const BASE_URL_SERVICES = '/services'

type APIResponse<T> = Promise<AxiosResponse<T>>

class APIClient {
  client: AxiosInstance

  constructor() {
    this.client = axios.create({
      responseType: 'json',
    })

    // Adds exponential backoff to requests
    axiosRetry(this.client, {
      retries: MAX_API_RETRY,
      retryDelay: exponentialDelay,
      onRetry: function (retryCount) {
        // Displays the "no connection" toast after maximum retry count
        // has been hit.
        // TODO: differentiate between "no internet connection"
        // and "server is down" errors.
        if (retryCount >= MAX_API_RETRY) {
          window.dispatchEvent(
            new window.CustomEvent('stmx:api_max_connection')
          )
        }
      },
    })
  }

  getAppTranslations = async (
    locale: string
  ): APIResponse<TranslationAPIResponse> => {
    return await this.client.get(`${BASE_URL_API_V1}/translate/${locale}/main`)
  }

  getSegmentTranslations = async (
    locale: string
  ): APIResponse<TranslationAPIResponse> => {
    return await this.client.get(
      `${BASE_URL_API_V1}/translate/${locale}/segment-info`
    )
  }

  // DEPRECATED: Use RTK Query's api, which caches user data
  getUser = async (userId: string): APIResponse<UserProfile> => {
    return await this.client.get(`${BASE_URL_API_V1}/users/${userId}`)
  }

  // Replaces (puts) the `data` object representing user settings
  putUserSettings = async (
    userId: string,
    payload: UserSettingsData
  ): APIResponse<void> => {
    return await this.client.put(`${BASE_URL_API_V1}/users/${userId}`, payload)
  }

  // Patches user account information (if allowed)
  patchUser = async (
    userId: string,
    payload: Partial<UserProfile>
  ): APIResponse<void> => {
    return await this.client.patch(
      `${BASE_URL_API_V1}/users/${userId}`,
      payload
    )
  }

  deleteUserLoginToken = async (userId: string): APIResponse<void> => {
    return await this.client.delete(
      `${BASE_URL_API_V1}/users/${userId}/login-token`
    )
  }

  getGalleryForUser = async (
    userId: string
  ): APIResponse<GalleryAPIResponse> => {
    return await this.client.get(`${BASE_URL_API_V1}/users/${userId}/streets`)
  }

  // Optional config is allowed for situations where we need to send a
  // custom header
  getStreet = async (
    streetId: string,
    config = {}
  ): APIResponse<StreetAPIResponse> => {
    return await this.client.get(
      `${BASE_URL_API_V1}/streets/${streetId}`,
      config
    )
  }

  // Internally, getting street data with UUID (above) is preferred, but
  // public URLs provide only creator ID and namespaced ID for cleaner URLs.
  // Use this method if all we have are those
  getStreetWithParams = async (
    creatorId: string | null,
    namespacedId: number
  ): APIResponse<StreetAPIResponse> => {
    const params = new URLSearchParams({
      namespacedId: namespacedId.toString(),
    })

    // creatorId can be null (e.g. anonymous streets)
    if (creatorId) {
      params.append('creatorId', creatorId)
    }

    // URLSearchParams.toString() automatically encodes URI strings for us.
    return await this.client.get(
      `${BASE_URL_API_V1}/streets/?${params.toString()}`
    )
  }

  postStreet = async (
    payload: StreetAPIPayload
  ): APIResponse<StreetAPIResponse> => {
    return await this.client.post(`${BASE_URL_API_V1}/streets`, payload)
  }

  putStreet = async (
    streetId: string,
    payload: StreetAPIPayload
  ): APIResponse<void> => {
    return await this.client.put(
      `${BASE_URL_API_V1}/streets/${streetId}`,
      payload
    )
  }

  deleteStreet = async (streetId: string): APIResponse<void> => {
    return await this.client.delete(`${BASE_URL_API_V1}/streets/${streetId}`)
  }

  deleteStreetImage = async (streetId: string): APIResponse<void> => {
    return await this.client.delete(
      `${BASE_URL_API_V1}/streets/${streetId}/image`
    )
  }

  getGalleryForAllStreets =
    async (): APIResponse<GalleryPaginatedAPIResponse> => {
      return await this.client.get(`${BASE_URL_API_V1}/streets?count=200`)
    }

  // TODO: API response type
  getSentimentSurveyStreet = async (): APIResponse<unknown> => {
    return await this.client.get(`${BASE_URL_API_V1}/votes`)
  }

  // TODO: API response type
  postSentimentSurveyVote = async (
    payload: SentimentVote
  ): APIResponse<unknown> => {
    return await this.client.post(`${BASE_URL_API_V1}/votes`, payload)
  }

  // TODO: API response type
  putSentimentSurveyComment = async (
    payload: SentimentComment
  ): APIResponse<unknown> => {
    return await this.client.put(`${BASE_URL_API_V1}/votes`, payload)
  }

  getChangelog = async (): APIResponse<string> => {
    return await this.client.get(`${BASE_URL_SERVICES}/changelog`)
  }

  getGeoIp = async (): APIResponse<GeoIpAPIResponse> => {
    return await this.client.get(`${BASE_URL_SERVICES}/geoip`)
  }
}

const client = new APIClient()

export const {
  getAppTranslations,
  getSegmentTranslations,
  getUser,
  putUserSettings,
  patchUser,
  getGalleryForUser,
  deleteUserLoginToken,
  getStreet,
  getStreetWithParams,
  postStreet,
  putStreet,
  deleteStreet,
  deleteStreetImage,
  getGalleryForAllStreets,
  getSentimentSurveyStreet,
  postSentimentSurveyVote,
  putSentimentSurveyComment,
  getChangelog,
  getGeoIp,
} = client

export default client
