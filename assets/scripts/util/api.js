import axios from 'axios'
import { API_URL } from '../app/config'

class APIClient {
  constructor () {
    this.client = axios.create({
      baseURL: API_URL + 'v1/',
      responseType: 'json'
    })
  }

  getStreet = async (streetId) => {
    const { data } = await this.client.get(`/streets/${streetId}`)
    return data
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
  getStreet,
  getGalleryForUser,
  getGalleryForAllStreets,
  getSentimentSurveyStreet,
  postSentimentSurveyVote,
  putSentimentSurveyComment
} = client

export default client
