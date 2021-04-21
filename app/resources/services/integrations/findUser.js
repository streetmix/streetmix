const { User } = require('../../../db/models')

/**
 finds the database record for the given user
 */
// TODO: return error, not 'user not found'
const findUser = async function (userId) {
  const user = await User.findOne({ where: { auth0Id: userId } })
  if (user === null) {
    return null
  }
  return user.dataValues
}
exports.findUser = findUser
