const Sequelize = require('sequelize')
const { User, Vote } = require('../../db/models')
const { v4: uuidv4 } = require('uuid')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  let ballot
  try {
    ballot = await Vote.findAll({
      where: {
        voterId: {
          [Sequelize.Op.is]: null
        }
      },
      order: Sequelize.literal('random()'),
      limit: 1
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error fetching ballot.' })
    return
  }
  const payload = { ballot }

  res.status(200).json(payload)
}

exports.post = async function (req, res) {
  const authUser = req.user || {}

  if (!authUser.sub) {
    res.status(401).json({ status: 401, msg: 'Please provide user ID.' })
    return
  }

  let user

  try {
    user = await User.findOne({ where: { auth0Id: authUser.sub } })
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error finding user.' })
    return
  }

  if (!user) {
    res.status(403).json({ status: 403, msg: 'User not found.' })
    return
  }

  // Is requesting user logged in?
  if (!authUser.sub || authUser.sub !== user.auth0Id) {
    res.status(401).end()
    return
  }

  // If requesting user is logged in, create a new vote
  const ballot = {
    id: uuidv4()
  }

  try {
    ballot.data = req.body.data
    ballot.score = req.body.score
    ballot.streetId = req.body.streetId
    ballot.voterId = authUser.sub
    await Vote.create(ballot)
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error filling ballot.' })
    return
  }
  const payload = { ballot }

  res.status(200).json(payload)
}
