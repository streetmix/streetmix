import axios from 'axios'

import { API_URL } from '../app/config'

import {
  getAuthHeader
} from '../users/authentication'

class APIClient {
  constructor () {
    this.client = axios.create({
      baseURL: API_URL + 'v1/',
      responseType: 'json'
    })
  }
    getStreet = async (streetId) => {
      const { data } = await this.client.get(`/streets/${streetId}`, {
        headers: { 'Authorization': getAuthHeader() }
      })
      return data
    };
};

const client = new APIClient()
export default client
