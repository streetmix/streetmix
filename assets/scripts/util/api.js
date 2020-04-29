import axios from 'axios'
import { API_URL } from '../app/config'
import { getAuthHeader } from '../users/authentication'

class APIClient {
  constructor () {
    this.client = axios.create({
      baseURL: API_URL + 'v1/',
      responseType: 'json'
    })
  }

  getStreet = async (streetId) => {
    const { data } = await this.client.get(`/streets/${streetId}`, {
      headers: { Authorization: getAuthHeader() }
    })
    return data
  }

  getGalleryForUser = (userId) => {
    return this.client.get(`/users/${userId}/streets`, {
      headers: { Authorization: getAuthHeader() }
    })
  }

  getGalleryForAllStreets = () => {
    return this.client.get('/streets?count=200')
  }
}

const client = new APIClient()

export const { getStreet, getGalleryForUser, getGalleryForAllStreets } = client

export default client
