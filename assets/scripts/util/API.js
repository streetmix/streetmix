import axios from 'axios'

import { API_URL } from '../app/config'

class APIClient {
  constructor () {
    this.client = axios.create({
      baseURL: API_URL + 'v1/',
      responseType: 'json'
    })
  }
    getStreet = async () => {
      const { data } = await this.client.get('/street')
      return data
    };
};

const client = new APIClient()
export default client
