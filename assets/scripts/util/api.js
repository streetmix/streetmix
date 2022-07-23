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

  getFlags = async () => {
    return this.client.get(`${BASE_URL_API_V1}/flags`)
  }

  getAppTranslations = async (locale) => {
    return this.client.get(`${BASE_URL_API_V1}/translate/${locale}/main`)
  }

  getSegmentTranslations = async (locale) => {
    return this.client.get(
      `${BASE_URL_API_V1}/translate/${locale}/segment-info`
    )
  }

  getStreet = async (streetId) => {
    const { data } = await this.client.get(
      `${BASE_URL_API_V1}/streets/${streetId}`
    )
    return data
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
}

const client = new APIClient()

export const {
  getFlags,
  getAppTranslations,
  getSegmentTranslations,
  getStreet,
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
  getChangelog
} = client

export default client
