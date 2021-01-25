const config = require('config')
const { User } = require('../../../db/models')
const passport = require('passport')
const PatreonStrategy = require('passport-patreon').Strategy

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
      // this would find by patreon id, but we also need the existing user
      // session login
      const user = async () => {
        await User.findByPk(user.id)
      }

      return done(null, user)
    }
  )
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  User.findByPk(user.id, function (err, user) {
    done(err, user)
  })
})

// exports.get = passport.authorize('patreon')
exports.get = (req, res, next) => {
  // seems to hang here?
  // auth0 nickname == user.id in our internal db
  passport.authorize('patreon', { state: req.user.nickname })(req, res, next)
}

// exports.get = passport.authenticate('patreon', { state: 'test' })
// exports.callback = {
//   get: passport.authenticate('patreon', { failureRedirect: '/' })
// }
exports.callback = {
  get: passport.authorize('patreon', {
    successRedirect: '/',
    failureRedirect: '/error'
  })
}
