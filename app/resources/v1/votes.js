const Sequelize = require('sequelize')
const { User, Vote } = require('../../db/models')
const { v4: uuidv4 } = require('uuid')
const logger = require('../../../lib/logger.js')()

exports.get = async function (req, res) {
  let ballot
  try {
    if (!req.user) {
      ballot = await Vote.findAll({
        where: {
          voterId: {
            [Sequelize.Op.is]: null
          }
        },
        order: Sequelize.literal('random()'),
        limit: 1
      })
    } else {
      ballot = await Vote.findAll({
        // where (submitted does not contain the user's auth0 ID, or is empty) AND (voterId is null)
        where: {
          [Sequelize.Op.and]: [
            {
              [Sequelize.Op.or]: [
                {
                  [Sequelize.Op.not]: {
                    submitted: {
                      [Sequelize.Op.contains]: [req.user.sub]
                    }
                  }
                },
                {
                  submitted: {
                    [Sequelize.Op.is]: null
                  }
                }
              ]
            },
            {
              voterId: {
                [Sequelize.Op.is]: null
              }
            }
          ]
        },
        order: Sequelize.literal('random()'),
        limit: 1
      })
    }
  } catch (error) {
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error fetching ballot.' })
    return
  }

  if (ballot && ballot.length === 0) {
    // no eligible streets remaining
    res
      .status(204)
      .json({ status: 204, msg: 'all eligible streets have been voted on' })
  }

  const payload = { ballot }

  res.status(200).json(payload)
}

exports.put = async function (req, res) {
  const authUser = req.user || {}
  const { id, comment } = req.body

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

  const ballot = await Vote.findOne({
    where: { id: id, voter_id: user.auth0Id }
  })

  if (!ballot) {
    res.status(403).json({ status: 403, msg: 'Ballot not found.' })
  }

  if (comment) {
    ballot.comment = comment
    await ballot.save()
  }

  res.status(200).json(ballot)
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

  let savedBallot = {}
  let updates = []
  try {
    ballot.data = req.body.data
    ballot.score = req.body.score
    ballot.streetId = req.body.streetId
    ballot.voterId = authUser.sub
    savedBallot = await Vote.create(ballot)

    // update existing ballot
    updates = await Vote.update(
      {
        submitted: Sequelize.fn(
          'array_append',
          Sequelize.col('submitted'),
          user.auth0Id
        )
      },
      {
        where: {
          streetId: ballot.streetId,
          voterId: {
            [Sequelize.Op.is]: null
          }
        }
      }
    )
  } catch (error) {
    console.log({ error })
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error filling ballot.' })
    return
  }
  const payload = { ballot, savedBallot, updates: updates }

  res.status(200).json(payload)
}
