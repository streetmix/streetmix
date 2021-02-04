const config = require('config')
const { User } = require('../../../db/models')
const passport = require('passport')
const PatreonStrategy = require('passport-patreon').Strategy

const findUser = async function (userId) {
  const user = await User.findByPk(userId)
  if (user === null) {
    return 'user not found'
  }
  return user.dataValues
}

passport.use(
  new PatreonStrategy(
    {
      clientID: process.env.PATREON_CLIENT_ID,
      clientSecret: process.env.PATREON_CLIENT_SECRET,
      callbackURL: `${config.restapi.protocol}${config.app_host_port}/services/integrations/patreon/callback`,
      scope: 'users pledges-to-me my-campaign',
      passReqToCallback: true
    },
    async function (req, accessToken, refreshToken, profile, done) {
      // this could find by patreon id, but we also need the existing user
      // im not sure if this is the best place to handle checking the DB or not
      const DBuser = await findUser(req.query.state)
      // passing profile along the request, probably another way to do this
      req.profile = profile
      return done(null, DBuser)
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (id, done) {
  const user = async () => {
    await User.findByPk(id)
  }
  done(null, user)
})

exports.get = (req, res, next) => {
  // at this point the request has user info from auth0
  // auth0 nickname == user.id in our internal db that we'll need later
  // this might not be available if the user isn't signed in
  // we could add error handiling for this, but also they _should_ only ever be
  // getting here from a button that you only see when you're signed in..
  passport.authorize('patreon', {
    state: req.user.nickname,
    failureRedirect: '/error'
  })(req, res, next)
}

exports.callback = (req, res, next) => {
  passport.authorize('patreon', {
    failureRedirect: '/error'
  })(req, res, next)
}

exports.connectUser = (req, res) => {
  // pass profile here, construct an object to save to user DB
  const account = req.account
  const identities = {
    provider: req.profile.provider,
    user_id: req.profile.id
  }
  res.redirect('/')
}
