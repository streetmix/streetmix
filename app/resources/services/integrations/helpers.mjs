import models from '../../../db/models/index.mjs'

const { User, UserConnections, sequelize } = models

/**
 finds the database record for the given user
 */
// might be better to do something besides return null
// we can actually probably get rid of this function if we want, but it might help
// keep some of the other code clean
export async function findUser (userId) {
  const user = await User.findOne({ where: { auth0Id: userId } })
  if (user === null) {
    return null
  }
  return user.dataValues
}

// if the provider we're trying to find exists
// return its index value or -1 if not found
export function addOrUpdateByProviderName (array, item) {
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
export async function syncAccountStatus (userId) {
  const databaseUser = await User.findOne({ where: { auth0Id: userId } })
  if (databaseUser.identities.some((identity) => 'user_id' in identity)) {
    databaseUser.addRole('SUBSCRIBER_1')
  }
}

/**
 * When a user has successfully connected their Streetmix account with a third-
 * party identity provider, record that connected identity with the user's
 * Streetmix data in the UserConnection table.
 *
 * @todo Remove first attempt at storing identity information as a JSON blob
 *        on a User model
 * @param {Object} account - User's Streetmix account information
 * @param {Object} profile - User's connected identity information
 * @returns {Promise}
 */
export function addUserConnection (account, profile) {
  const identities = account.identities
  const identity = {
    provider: profile.provider,
    user_id: profile.id,
    access_token: profile.access_token || undefined, // Coil
    refresh_token: profile.refresh_token || undefined // Coil
  }

  // if provider exists, should update that item
  // if not, should add to the object list
  // TODO: Deprecated
  addOrUpdateByProviderName(identities, identity)

  return sequelize.transaction(async (t) => {
    // This is a previous attempt, where we saved connected identity
    // information to a JSON field in the User model. A newer method (using
    // the UserConnection table) is used below. Both are currently used to
    // test concurrent data validity. In time, the User.update() method should
    // be removed.
    await User.update(
      {
        identities
      },
      { where: { auth0Id: account.auth0Id }, returning: true, transaction: t }
    )

    await UserConnections.findOrCreate({
      where: {
        user_id: account.id,
        provider: profile.provider
      },
      transaction: t
    })
    return await UserConnections.update(
      {
        provider_user_id: profile.id,
        metadata: profile
      },
      {
        where: {
          user_id: account.id,
          provider: profile.provider
        },
        returning: true,
        transaction: t
      }
    )
  })
}
