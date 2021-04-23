const { User } = require('../../../db/models')

/**
 given a user, check their identity data,
 depending on what data you find, add subscriber role

 TODO: make this less permissive(maybe add a status field or have logic depending on the provider), tested,
 and remove the role if we're confident we should (probably shouldn't worry about this for MVP)
 */
const syncAccountStatus = async function (userId) {
  const databaseUser = await User.findOne({ where: { auth0Id: userId } })
  if ('user_id' in databaseUser.identities) {
    databaseUser.addRole('SUBSCRIBER_1')
  }
}
exports.syncAccountStatus = syncAccountStatus
