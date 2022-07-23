import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

const MAX_API_RETRY = 3
const BASE_URL_API_V1 = '/api/v1'
const BASE_URL_SERVICES = '/services'

class APIClient {
  constructor () {
    this.client = axios.create({
      responseType: 'json'
    })

    // Adds exponential backoff to requests
    axiosRetry(this.client, {
      retries: MAX_API_RETRY,
      retryDelay: exponentialDelay,
      onRetry: function (retryCount, error, requestConfig) {
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

  getAppTranslations = (locale) => {
    return this.client.get(`${BASE_URL_API_V1}/translate/${locale}/main`)
  }

  getSegmentTranslations = (locale) => {
    return this.client.get(
      `${BASE_URL_API_V1}/translate/${locale}/segment-info`
    )
  }

  // Optional config is allowed for situations where we need to send a
  // custom header
  getStreet = (streetId, config = {}) => {
    return this.client.get(`${BASE_URL_API_V1}/streets/${streetId}`, config)
  }

  // Internally, getting street data with UUID (above) is preferred, but
  // public URLs provide only creator ID and namespaced ID for cleaner URLs.
  // Use this method if all we have are those
  getStreetWithParams = (creatorId, namespacedId) => {
    const params = new URLSearchParams({
      namespacedId: encodeURIComponent(namespacedId)
    })
    // creatorId can be undefined (e.g. anonymous streets)
    if (creatorId) {
      params.append('creatorId', encodeURIComponent(creatorId))
    }
    return this.client.get(`${BASE_URL_API_V1}/streets/?${params.toString()}`)
  }

  postStreet = (payload) => {
    return this.client.post(`${BASE_URL_API_V1}/streets`, payload)
  }

  putStreet = (streetId, payload) => {
    return this.client.put(`${BASE_URL_API_V1}/streets/${streetId}`, payload)
  }

  deleteStreet = (streetId) => {
    return this.client.delete(`${BASE_URL_API_V1}/streets/${streetId}`)
  }

  deleteStreetImage = (streetId) => {
    return this.client.delete(`${BASE_URL_API_V1}/streets/images/${streetId}`)
  }

  putUserSettings = (userId, payload) => {
    return this.client.put(`${BASE_URL_API_V1}/users/${userId}`, payload)
  }

  getGalleryForUser = (userId) => {
    return this.client.get(`${BASE_URL_API_V1}/users/${userId}/streets`)
  }

  getGalleryForAllStreets = () => {
    return this.client.get(`${BASE_URL_API_V1}/streets?count=200`)
  }

  getSentimentSurveyStreet = () => {
    return this.client.get(`${BASE_URL_API_V1}/votes`)
  }

  postSentimentSurveyVote = (payload) => {
    return this.client.post(`${BASE_URL_API_V1}/votes`, payload)
  }

  putSentimentSurveyComment = (payload) => {
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
  getStreet,
  getStreetWithParams,
  postStreet,
  putStreet,
  deleteStreet,
  deleteStreetImage,
  putUserSettings,
  getGalleryForUser,
  getGalleryForAllStreets,
  getSentimentSurveyStreet,
  postSentimentSurveyVote,
  putSentimentSurveyComment,
  getChangelog,
  getGeoIp
} = client

export default client
