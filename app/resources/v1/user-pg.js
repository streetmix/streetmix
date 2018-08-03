// const config = require('config')
// const uuid = require('uuid')
// const Twitter = require('twitter')
// const { random } = require('lodash')
// const { ERRORS } = require('../../../lib/util')
// const logger = require('../../../lib/logger.js')()
// const User = require('../../db/models/user')

// exports.post = async function (req, res) {
//   let loginToken = null
//   let body

//   try {
//     body = req.body
//   } catch (e) {
//     res.status(400).send('Could not parse body as JSON.')
//     return
//   }

//   if (body.hasOwnProperty('twitter')) {
//     // TODO: Validation
//     // handleTwitterSignIn(body.twitter)
//   } else if (body.hasOwnProperty('auth0_twitter')) {
//     handleAuth0TwitterSignIn(body.auth0_twitter)
//   } else if (body.hasOwnProperty('auth0_email')) {
//     handleEmailSignIn(body.auth0_email)
//   } else {
//     res.status(400).send('Unknown sign-in method used.')
//   }
// }
