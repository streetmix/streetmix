import React, { Component } from 'react'
import StripeCheckout from 'react-stripe-checkout'
// import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import { STRIPE_API_KEY } from '../app/config'
// import './UpgradeDialog.scss'

class UpgradeDialog extends Component {
  scriptContainerEl = React.createRef()

  onToken = (token, addresses) => {
    // TODO: Send the token information and any other
    // relevant information to your payment process
    // server, wait for the response, and update the UI
    // accordingly. How this is done is up to you. Using
    // XHR, fetch, or a GraphQL mutation is typical.
    console.log('onToken', token, addresses)
  }

  render () {
    return (
      <Dialog>
        {(closeDialog) => (
          <div className="upgrade-dialog" dir="ltr">
            <header>
              <h1>
                Upgrade
              </h1>
            </header>
            <div className="dialog-content">
              <p>
                <strong>TEST CONTENT!</strong>
              </p>
              <form action="/pay" method="post">
                <article>
                  <label>Amount: $5.00</label>
                </article>
                <StripeCheckout
                  amount={1000}
                  name="Streetmix"
                  description="Activate your Enthusiast subscription"
                  locale="auto"
                  stripeKey={STRIPE_API_KEY}
                  token={this.onToken}
                  zipCode
                />
              </form>
            </div>
          </div>
        )}
      </Dialog>
    )
  }
}

export default UpgradeDialog
