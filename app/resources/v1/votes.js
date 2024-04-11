import Sequelize from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import models from '../../db/models/index.js'
import logger from '../../lib/logger.js'

const { User, Vote, Street } = models

const MAX_COMMENT_LENGTH = 280
const SURVEY_FINISHED_PATH = '/survey-finished'

export function generateRandomBallotFetch ({ redirect = false }) {
  return async function (req, res) {
    let ballots
    const authUser = req.auth || {}
    let user
    if (authUser.sub) {
      try {
        user = await User.findOne({ where: { auth0Id: authUser.sub } })
      } catch (error) {
        logger.error(error)
        res.status(500).json({ status: 500, msg: 'Error finding user.' })
        return
      }
    }

    try {
      let hasValidStreet = false
      while (!hasValidStreet) {
        if (!req.auth) {
          ballots = await Vote.findAll({
            where: {
              voterId: {
                [Sequelize.Op.is]: null
              }
            },
            order: Sequelize.literal('random()'),
            limit: 1
          })
        } else {
          ballots = await Vote.findAll({
            // where (submitted does not contain the user's auth0 ID, or is empty) AND (voterId is null)
            where: {
              [Sequelize.Op.and]: [
                {
                  [Sequelize.Op.or]: [
                    {
                      [Sequelize.Op.not]: {
                        submitted: {
                          [Sequelize.Op.contains]: [user.id]
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
        if (ballots && ballots.length > 0) {
          const myBallot = ballots[0]
          const { streetId } = myBallot
          if (streetId) {
            const streetForBallot = await Street.findOne({
              where: { id: streetId }
            })

            // do not return a vote to the same user
            const isCreator = user && user.id === streetForBallot.creatorId

            if (
              !isCreator &&
              streetForBallot &&
              streetForBallot.status &&
              streetForBallot.status === 'ACTIVE'
            ) {
              hasValidStreet = true
            } else if (isCreator) {
              // update existing ballot
              await Vote.update(
                {
                  submitted: Sequelize.fn(
                    'array_append',
                    Sequelize.col('submitted'),
                    user.id
                  )
                },
                {
                  where: {
                    streetId: streetForBallot.id,
                    voterId: {
                      [Sequelize.Op.is]: null
                    }
                  }
                }
              )
            } else {
              // since streets cannot be deleted, this ballot is no longer valid
              myBallot.voterId = 'DELETED'
              await myBallot.save()
            }
          } else {
            return res
              .status(500)
              .json({ status: 500, msg: 'Error fetching street for ballot.' })
          }
        }

        if (!ballots || ballots.length === 0) {
          // no ballots remaining
          if (redirect) {
            return res.redirect(SURVEY_FINISHED_PATH)
          } else {
            return res.status(204).json({
              status: 204,
              msg: 'All eligible streets have been voted on.'
            })
          }
        }
      }
    } catch (error) {
      logger.error(error)
      res.status(500).json({ status: 500, msg: 'Error fetching ballots.' })
      return
    }

    if (redirect) {
      let street
      let candidateStreetUrl = '/'
      try {
        if (!(ballots[0] && ballots[0].data && ballots[0].streetId)) {
          res.status(503).json({
            status: 503,
            msg: 'Server found no candidate streets for voting.'
          })
          return
        }

        const streetId = ballots[0].streetId
        if (!streetId) throw new Error('no street ID found for ballots!')
        street = await Street.findOne({ where: { id: streetId } })

        if (!street.creatorId) {
          candidateStreetUrl = `/-/${street.namespacedId}`
        } else {
          candidateStreetUrl = `/${street.creatorId}/${street.namespacedId}`
        }
      } catch (error) {
        logger.error(error)
        res
          .status(500)
          .json({ status: 500, msg: 'Error fetching street from ballot.' })
        return
      }

      // hack to return user to the survey street after signing in
      res.cookie('last_survey_url', candidateStreetUrl)
      return res.redirect(candidateStreetUrl)
    }

    const payload = { ballots }

    return res.status(200).json(payload)
  }
}

export const get = generateRandomBallotFetch({ redirect: false })

export async function put (req, res) {
  const authUser = req.auth || {}
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
    where: { id, voter_id: user.id }
  })

  if (!ballot) {
    return res.status(403).json({ status: 403, msg: 'Ballot not found.' })
  }

  if (comment) {
    if (comment.length > MAX_COMMENT_LENGTH) {
      res
        .status(413)
        .json({ status: 413, msg: 'Ballot must be 280 characters or less' })
      return
    }

    try {
      ballot.comment = comment
      await ballot.save()
    } catch (error) {
      logger.error(error)
      res.status(500).json({ status: 500, msg: 'Error updating ballot.' })
      return
    }
  }

  res.status(200).json(ballot)
}

export async function post (req, res) {
  const authUser = req.auth || {}

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
    ballot.voterId = user.id
    savedBallot = await Vote.create(ballot)

    // update existing ballot
    updates = await Vote.update(
      {
        submitted: Sequelize.fn(
          'array_append',
          Sequelize.col('submitted'),
          user.id
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
    logger.error(error)
    res.status(500).json({ status: 500, msg: 'Error filling ballot.' })
    return
  }
  const payload = { ballot, savedBallot, updates }

  res.status(200).json(payload)
}
