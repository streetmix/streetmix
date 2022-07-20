import axios from 'axios'

class APIClient {
  constructor () {
    this.client = axios.create({
      baseURL: '/api/v1/',
      responseType: 'json'
    })
  }

  getFlags = async () => {
    return this.client.get('/flags')
  }

  getStreet = async (streetId) => {
    const { data } = await this.client.get(`/streets/${streetId}`)
    return data
  }

  deleteStreetImage = (streetId) => {
    return this.client.delete(`/streets/images/${streetId}`)
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
  getStreet,
  deleteStreetImage,
  getGalleryForUser,
  getGalleryForAllStreets,
  getSentimentSurveyStreet,
  postSentimentSurveyVote,
  putSentimentSurveyComment
} = client

export default client
