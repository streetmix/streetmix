const config = require('config')
const stripe = require('stripe')(config.stripe.api_secret)

exports.post = (req, res) => {
  let amount = 1000

  stripe.customers.create({
    email: req.body.stripeEmail,
    source: req.body.stripeToken
  })
    .then(customer => console.log(customer) ||
      stripe.charges.create({
        amount,
        description: 'Sample Charge',
        currency: 'usd',
        customer: customer.id
      }))
    .then(charge => console.log(charge) || res.render('main'))
}
