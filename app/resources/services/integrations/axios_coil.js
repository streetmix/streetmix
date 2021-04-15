const config = require('config')
const logger = require('../../../../lib/logger.js')()

const { User } = require('../../../db/models')
const axios = require('axios')
const querystring = require('querystring')

/**
 * Retrieves user/auth from coil
 *
 */

const getUserAccessPermission = async () => {
  try {
    return await axios.get('https://coil.com/oauth/auth', {
      params: {
        scope: 'simple_wm openid',
        client_id: process.env.COIL_CLIENT_ID,
        prompt: 'signup',
        state: 'astring',
        redirect_uri: `${config.restapi.protocol}${config.app_host_port}/services/integrations/coil/callback`
      }
    })
  } catch (error) {
    console.error(error)
  }
}

// should return a theAuthCode to be used by the below function

const getUserAccessToken = async () => {
  try {
    const encodedAuth = encodeURIComponent(
      btoa(process.env.COIL_CLIENT_ID + ':' + process.env.COIL_CLIENT_SECRET)
    )
    const options = {
      headers: {
        Authorization: 'Basic ' + encodedAuth,
        Accept: 'application/x-www-form-urlencoded'
      }
    }
    return await axios.post('https://coil.com/oauth/token', {
      params: {
        scope: 'simple_wm openid',
        code: theAuthCode,
        grant_type: 'authorization_code',
        redirect_uri: `${config.restapi.protocol}${config.app_host_port}/services/integrations/coil/callback`
      },
      options
    })
  } catch (error) {
    console.error(error)
  }
}
