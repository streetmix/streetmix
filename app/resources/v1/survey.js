const Sequelize = require('sequelize')
const { Street, Vote } = require('../../db/models')
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
  // const payload = { ballot }
  let street
  let candidateStreetUrl = '/'
  try {
    const streetId = ballot[0].data.street.id

    if (!streetId) throw new Error('no street ID found for ballot!')
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

  res.redirect(candidateStreetUrl)
}
