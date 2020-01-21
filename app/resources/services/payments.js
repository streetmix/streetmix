const config = require('config')
const stripe = require('stripe')(config.stripe.api_secret)
const User = require('../../db/models/user.js')
const roles = require('../../data/user_roles.json')
const logger = require('../../../lib/logger.js')()
const tier1PlanId = config.stripe.tier1_plan_id

const planMap = {
  [tier1PlanId]: roles.SUBSCRIBER_1
}

exports.post = async (req, res) => {
  let userId
  let subscription
  let customer
  try {
    userId = req.body.userId
    logger.info(`submitting payment for ${userId}`)
    const {
      token: { email, id }
    } = req.body

    customer = await stripe.customers.create({
      email,
      source: id,
      description: `Subscriber for ${userId}`
    })

    subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          plan: tier1PlanId
        }
      ]
    })
  } catch (err) {
    logger.error(err)
    res
      .status(500)
      .json({ status: 500, msg: 'Unexpected error while submitting payment.' })
    return
  }

  let user
  try {
    user = await User.findOne({ where: { id: userId } })
  } catch (err) {
    logger.error(err)
    res
      .status(401)
      .json({ status: 401, msg: 'Unexpected error while finding user.' })
    return
  }

  if (!user) {
    res.status(404).json({ status: 404, msg: 'Could not find user data.' })
  }

  try {
    const { data, roles } = user
    const newRole = planMap[tier1PlanId].value

    // if we already have the role, skip adding it
    if (!roles.includes(newRole)) {
      roles.push(newRole)
      user.roles = roles
    }
    const now = new Date()
    const newData = {
      ...data,
      subscribed: now,
      subscriptionId: subscription.id,
      customerId: customer.id,
      planId: tier1PlanId
    }
    user.data = newData
    user.save().then((upgradedUser) => {
      logger.info({ upgradedUser, subscription }, 'added user subscription')
      res.status(200).json({ user: upgradedUser, subscription })
    })

    return
  } catch (err) {
    logger.error(err)
    res
      .status(500)
      .json({ status: 500, msg: 'Unexpected error while processing payment.' })
  }
}
