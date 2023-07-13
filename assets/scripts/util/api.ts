import axios, { AxiosInstance } from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'
import {
  SentimentComment,
  SentimentVote,
  StreetData,
  UserProfile,
  UserSettingsData
} from '../types'

const MAX_API_RETRY = 3
const BASE_URL_API_V1 = '/api/v1'
const BASE_URL_SERVICES = '/services'

class APIClient {
  client: AxiosInstance

  constructor () {
    this.client = axios.create({
      responseType: 'json'
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
      }
    })
  }

  getFlags = () => {
    return this.client.get(`${BASE_URL_API_V1}/flags`)
  }

  getAppTranslations = (locale: string) => {
    return this.client.get(`${BASE_URL_API_V1}/translate/${locale}/main`)
  }

  getSegmentTranslations = (locale: string) => {
    return this.client.get(
      `${BASE_URL_API_V1}/translate/${locale}/segment-info`
    )
  }

  // DEPRECATED: Use RTK Query's api, which caches user data
  getUser = (userId: string) => {
    return this.client.get(`${BASE_URL_API_V1}/users/${userId}`)
  }

  // Replaces (puts) the `data` object representing user settings
  putUserSettings = (userId: string, payload: UserSettingsData) => {
    return this.client.put(`${BASE_URL_API_V1}/users/${userId}`, payload)
  }

  // Patches user account information (if allowed)
  patchUser = (userId: string, payload: Partial<UserProfile>) => {
    return this.client.patch(`${BASE_URL_API_V1}/users/${userId}`, payload)
  }

  deleteUserLoginToken = (userId: string) => {
    return this.client.delete(`${BASE_URL_API_V1}/users/${userId}/login-token`)
  }

  getGalleryForUser = (userId: string) => {
    return this.client.get(`${BASE_URL_API_V1}/users/${userId}/streets`)
  }

  // Optional config is allowed for situations where we need to send a
  // custom header
  getStreet = (streetId: string, config = {}) => {
    return this.client.get(`${BASE_URL_API_V1}/streets/${streetId}`, config)
  }

  // Internally, getting street data with UUID (above) is preferred, but
  // public URLs provide only creator ID and namespaced ID for cleaner URLs.
  // Use this method if all we have are those
  getStreetWithParams = (creatorId: string, namespacedId: string) => {
    const params = new URLSearchParams({
      namespacedId: encodeURIComponent(namespacedId)
    })
    // creatorId can be undefined (e.g. anonymous streets)
    if (creatorId) {
      params.append('creatorId', encodeURIComponent(creatorId))
    }
    return this.client.get(`${BASE_URL_API_V1}/streets/?${params.toString()}`)
  }

  postStreet = (payload: StreetData) => {
    return this.client.post(`${BASE_URL_API_V1}/streets`, payload)
  }

  putStreet = (streetId: string, payload: StreetData) => {
    return this.client.put(`${BASE_URL_API_V1}/streets/${streetId}`, payload)
  }

  deleteStreet = (streetId: string) => {
    return this.client.delete(`${BASE_URL_API_V1}/streets/${streetId}`)
  }

  deleteStreetImage = (streetId: string) => {
    return this.client.delete(`${BASE_URL_API_V1}/streets/images/${streetId}`)
  }

  getGalleryForAllStreets = () => {
    return this.client.get(`${BASE_URL_API_V1}/streets?count=200`)
  }

  getSentimentSurveyStreet = () => {
    return this.client.get(`${BASE_URL_API_V1}/votes`)
  }

  postSentimentSurveyVote = (payload: SentimentVote) => {
    return this.client.post(`${BASE_URL_API_V1}/votes`, payload)
  }

  putSentimentSurveyComment = (payload: SentimentComment) => {
    return this.client.put(`${BASE_URL_API_V1}/votes`, payload)
  }

  getChangelog = () => {
    return this.client.get(`${BASE_URL_SERVICES}/changelog`)
  }

  getGeoIp = () => {
    return this.client.get(`${BASE_URL_SERVICES}/geoip`)
  }
}

const client = new APIClient()

export const {
  getFlags,
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
  getGeoIp
} = client

export default client
