const btoa = require('btoa')
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth').OAuth2Strategy
const InternalOAuthError = require('passport-oauth2').InternalOAuthError
const axios = require('axios')
const { User } = require('../../../db/models')
const appURL = require('../../../../lib/url.js')
const logger = require('../../../../lib/logger.js')

const { findUser, addUserConnection, syncAccountStatus } = require('./helpers')

const initCoil = () => {
  const authToken = btoa(
    process.env.COIL_CLIENT_ID +
      ':' +
      encodeURIComponent(process.env.COIL_CLIENT_SECRET)
  )
  const coilStrategy = new OAuth2Strategy(
    {
      authorizationURL: 'https://coil.com/oauth/auth',
      tokenURL: 'https://coil.com/oauth/token',
      clientID: process.env.COIL_CLIENT_ID,
      clientSecret: process.env.COIL_CLIENT_SECRET,
      scope: 'simple_wm openid',
      callbackURL: `${appURL.origin}/services/integrations/coil/callback`,
      passReqToCallback: true,
      customHeaders: {
        authorization: `Basic ${authToken}`,
        'content-type': 'application/x-www-form-urlencoded'
      }
    },
    async function (req, accessToken, refreshToken, params, profile, done) {
      // params are returned by passport from the request
      const databaseUser = await findUser(req.query.state)
      // passing the profile data along the request, probably another way to do this
      // we get the access token here, which we may need to then pass to the next endpoint for coil to get the user info (subscriptions, etc)
      req.profile = profile
      profile.refresh_token = refreshToken
      return done(null, databaseUser)
    }
  )

  const getUserInfo = async (accessToken, done) => {
    try {
      const requestConfig = {
        method: 'post',
        url: 'https://api.coil.com/user/info',
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'content-type': 'application/x-www-form-urlencoded'
        }
      }
      const response = await axios(requestConfig)
      const profile = { provider: 'coil' }
      profile.id = response.data.sub
      profile.access_token = accessToken
      done(null, profile)
    } catch (error) {
      logger.error(error)
      return done(new InternalOAuthError('failed to fetch user profile', error))
    }
  }

  // make a custom function get userProfile data (passport oauth default is nothing)
  coilStrategy.userProfile = function (accessToken, done) {
    getUserInfo(accessToken, done)
  }
  passport.use('coil', coilStrategy)

  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (id, done) {
    const user = async () => {
      await User.findByPk(id)
    }
    done(null, user)
  })
}

// Only initialize Patreon auth strategy if the env vars are set.
if (process.env.COIL_CLIENT_ID && process.env.COIL_CLIENT_SECRET) {
  initCoil()
}

exports.get = (req, res, next) => {
  if (!process.env.COIL_CLIENT_ID || !process.env.COIL_CLIENT_SECRET) {
    res.status(500).json({ status: 500, msg: 'Coil integration unavailable.' })
  }

  /*
    at this point,the request has user info from auth0 that we passed to this route
    auth0 nickname == user.id in our internal db that we'll need later for lookup

    this might not be available if the user isn't signed in
      we could add error handiling for this, but also they _should_ only ever be
      getting here from a button that you only see when you're signed in..
    */
  passport.authorize('coil', {
    state: req.user.sub,
    failureRedirect: '/error'
  })(req, res, next)
}

exports.callback = (req, res, next) => {
  if (!process.env.COIL_CLIENT_ID || !process.env.COIL_CLIENT_SECRET) {
    res.status(500).json({ status: 500, msg: 'Coil integration unavailable.' })
  }
  passport._strategies.coil._oauth2.setAuthMethod('BASIC')
  passport.authorize('coil', {
    failureRedirect: '/error'
  })(req, res, next)
}

const getBTPToken = async (accessToken) => {
  try {
    const requestConfig = {
      method: 'post',
      url: 'https://api.coil.com/user/btp',
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'content-type': 'application/x-www-form-urlencoded'
      }
    }
    const response = await axios(requestConfig)
    const token = response.data.btpToken
    return token
  } catch (error) {
    logger.error(error)
  }
}

/**
 * connects the third party profile with the database user record
 * pass third party profile data here, construct an object to save to user DB
 */
exports.connectUser = async (req, res, next) => {
  // in passport, using 'authorize' attaches user data to 'account'
  // instead of overriding the user session data
  const account = req.account
  const profile = req.profile

  // if we get the BTP Token, thats good enough to add the Role
  // later we might need to check, refresh
  try {
    // we pass the token to the request session, so it should persist as long as the user has their browser open
    const btpToken = await getBTPToken(req.profile.access_token)
    req.session.btpToken = btpToken

    await addUserConnection(account, profile)
    await syncAccountStatus(account.auth0Id)

    // first you redirect, the token dosen't seem present, but its in the session thereafter..
    res.redirect('/')
  } catch (error) {
    // what would we want to do here?
    logger.error(error)
    res.redirect('/error')
  }
}
