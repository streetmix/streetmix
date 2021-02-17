const config = require('config')
const logger = require('../../../../lib/logger.js')()

const { User } = require('../../../db/models')
const passport = require('passport')
const PatreonStrategy = require('passport-patreon').Strategy

/*
our use case makes this a little complicated,
we basically have three user instances to check:

 * Auth0 data on a user who is authenticated (aka 'user)
 * Data on this user that we store in our database (aka 'databaseUser')
 * Data from a user's third party account (aka profile)

Our existing code handles login using the auth0 service,
which if valid we store a JWT.

We pass this to the initial get route,
which passes along the account id/name (and errors if no one is signed in)

We then pass this to our passport strategy, which grabs third party data and
looks up the user in _our_ database, which then gets handled by the callback function
an subsequently links all this info together

*/

/**
 finds the database record for the given user
 */
const findUser = async function (userId) {
  const user = await User.findByPk(userId)
  if (user === null) {
    return 'user not found'
  }
  return user.dataValues
}

const initPatreon = () => {
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
        /*
        this is what passport calls the 'verify callback'
        our case is a little different since we already have a logged in user
        not sure if this is the best place to handle checking the DB or not but it works
         */
        const databaseUser = await findUser(req.query.state)
        // passing the profile data along the request, probably another way to do this
        req.profile = profile
        return done(null, databaseUser)
      }
    )
  )

  // these aren't used yet, but would be if we start using persistent user sessions
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
if (process.env.PATREON_CLIENT_ID && !process.env.PATREON_CLIENT_SECRET) {
  initPatreon()
}

exports.get = (req, res, next) => {
  if (!process.env.PATREON_CLIENT_ID || !process.env.PATREON_CLIENT_SECRET) {
    res
      .status(500)
      .json({ status: 500, msg: 'Patreon integration unavailable.' })
  }

  /*
  at this point,the request has user info from auth0 that we passed to this route
  auth0 nickname == user.id in our internal db that we'll need later for lookup

  this might not be available if the user isn't signed in
    we could add error handiling for this, but also they _should_ only ever be
    getting here from a button that you only see when you're signed in..
  */
  passport.authorize('patreon', {
    state: req.user.nickname,
    failureRedirect: '/error'
  })(req, res, next)
}

exports.callback = (req, res, next) => {
  if (!process.env.PATREON_CLIENT_ID || !process.env.PATREON_CLIENT_SECRET) {
    res
      .status(500)
      .json({ status: 500, msg: 'Patreon integration unavailable.' })
  }

  passport.authorize('patreon', {
    failureRedirect: '/error'
  })(req, res, next)
}

/**
 * connects the third party profile with the database user record
 * pass third party profile data here, construct an object to save to user DB
 */
exports.connectUser = async (req, res) => {
  // in passport, using 'authorize' attaches user data to 'account'
  // instead of overriding the user session data
  const databaseUser = req.account
  const identity = {
    provider: req.profile.provider,
    user_id: req.profile.id
  }
  try {
    await User.update(
      {
        identities: [identity]
      },
      { where: { id: databaseUser.id }, returning: true }
    )
    res.redirect('/')
  } catch (err) {
    // what would we want to do here?
    logger.error(err)
    res.redirect('/error')
  }
}
