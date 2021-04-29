const { User } = require('../../../db/models')

/**
 finds the database record for the given user
 */
// might be better to do something besides return null
// we can actually probably get rid of this function if we want, but it might help
// keep some of the other code clean
const findUser = async function (userId) {
  const user = await User.findOne({ where: { auth0Id: userId } })
  if (user === null) {
    return null
  }
  return user.dataValues
}

// if the provider we're trying to find exists
// return its index value or -1 if not found
const addOrUpdateByProviderName = function (array, item) {
  const indexValue = array.findIndex(
    (_item) => _item.provider === item.provider
  )
  if (indexValue === -1) {
    array.push(item)
  } else {
    array[indexValue] = item
  }
}

/**
 given a user, check their identity data,
 depending on what data you find, add subscriber role

 TODO: make this less permissive(maybe add a status field or have logic depending on the provider), tested,
 and remove the role if we're confident we should (probably shouldn't worry about this for MVP)
 */
const syncAccountStatus = async function (userId) {
  const databaseUser = await User.findOne({ where: { auth0Id: userId } })
  if (databaseUser.identities.some((identity) => 'user_id' in identity)) {
    databaseUser.addRole('SUBSCRIBER_1')
  }
}

module.exports = { findUser, addOrUpdateByProviderName, syncAccountStatus }
