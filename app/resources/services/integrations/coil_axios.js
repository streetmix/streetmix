const config = require('config')
const logger = require('../../../../lib/logger.js')()

const { User } = require('../../../db/models')
const axios = require('axios')
const querystring = require('querystring')

/**
 * Retrieves user/auth from coil
 *
 */

exports.get = async (req, res, next) => {
  if (!process.env.COIL_CLIENT_ID || !process.env.COIL_CLIENT_SECRET) {
    res.status(500).json({ status: 500, msg: 'Coil integration unavailable.' })
  }
  try {
    const params = {
      response_type: 'code',
      scope: 'simple_wm openid',
      client_id: process.env.COIL_CLIENT_ID,
      state: 'astring',
      redirect_uri: `${config.restapi.protocol}${config.app_host_port}/services/integrations/coil/callback`,
      prompt: 'signup'
    }
    const response = await axios.get('https://coil.com/oauth/auth', {
      params: params
    })
    console.log(response)
    return response.data
  } catch (error) {
    console.error(error)
  }
}

exports.callback = async (req, res, next) => {
  if (!process.env.COIL_CLIENT_ID || !process.env.COIL_CLIENT_SECRET) {
    res.status(500).json({ status: 500, msg: 'Coil integration unavailable.' })
  }
  try {
    const params = querystring.stringify({
      code: req.query.code,
      grant_type: 'authorization_code',
      redirect_uri: `${config.restapi.protocol}${config.app_host_port}/services/integrations/coil/callback`
    })

    const requestConfig = {
      method: 'post',
      url: 'https://coil.com/oauth/token',
      headers: {
        Authorization:
          'Basic N2U3M2U1NjItZWY0Mi00ZTYzLTk0NzUtZDgyNmViYTQ2ZTNjOmM0JTJGdERyTjVaaU1NRiUyRiUyRkRzZXN6ZjE5QmZ0T1g2dFlEcjBzbDZ4aGVTOXBqS1l6REtBd2F3SG5GOFdwNVdmOQ==',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: params
    }

    const response = await axios(requestConfig)
    return response.data
  } catch (error) {
    console.error(error)
  }
}
