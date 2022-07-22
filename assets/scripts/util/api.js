import axios from 'axios'
import axiosRetry, { exponentialDelay } from 'axios-retry'

const MAX_API_RETRY = 3

class APIClient {
  constructor () {
    this.client = axios.create({
      baseURL: '/api/v1/',
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
    return this.client.get('/flags')
  }

  getAppTranslations = async (locale) => {
    return this.client.get(`translate/${locale}/main`)
  }

  getSegmentTranslations = async (locale) => {
    return this.client.get(`translate/${locale}/segment-info`)
  }

  getStreet = async (streetId) => {
    const { data } = await this.client.get(`/streets/${streetId}`)
    return data
  }

  putStreet = (streetId, payload) => {
    return this.client.put(`/streets/${streetId}`, payload)
  }

  deleteStreet = (streetId) => {
    return this.client.delete(`/streets/${streetId}`)
  }

  deleteStreetImage = (streetId) => {
    return this.client.delete(`/streets/images/${streetId}`)
  }

  putUserSettings = (userId, payload) => {
    return this.client.put(`/users/${userId}`, payload)
  }

  getGalleryForUser = (userId) => {
    return this.client.get(`/users/${userId}/streets`)
  }

  getGalleryForAllStreets = () => {
    return this.client.get('/streets?count=200')
  }

  getSentimentSurveyStreet = () => {
    return this.client.get('/votes')
  }

  postSentimentSurveyVote = (payload) => {
    return this.client.post('/votes', payload)
  }

  putSentimentSurveyComment = (payload) => {
    return this.client.put('/votes', payload)
  }
}

const client = new APIClient()

export const {
  getFlags,
  getAppTranslations,
  getSegmentTranslations,
  getStreet,
  putStreet,
  deleteStreet,
  deleteStreetImage,
  putUserSettings,
  getGalleryForUser,
  getGalleryForAllStreets,
  getSentimentSurveyStreet,
  postSentimentSurveyVote,
  putSentimentSurveyComment
} = client

export default client
