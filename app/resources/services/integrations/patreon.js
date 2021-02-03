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
    function (req, accessToken, refreshToken, profile, done) {
      // this could find by patreon id, but we also need the existing user
      // im not sure if this is the place to handle checking the DB or not
      const user = findUser(req.query.state)
      return done(null, user)
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
  passport.authorize('patreon', { state: req.user.nickname })(req, res, next)
}

exports.callback = (req, res, next) => {
  passport.authorize('patreon', {
    failureRedirect: '/error'
  })(req, res, next)
}
