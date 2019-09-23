import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import StripeCheckout from 'react-stripe-checkout'
import { connect } from 'react-redux'
import axios from 'axios'
import { STRIPE_API_KEY } from '../app/config'
import userRoles from '../../../app/data/user_roles.json'
import Dialog from './Dialog'
import './UpgradeDialog.scss'

const DEFAULT_BODY = 'Thank you for using Streetmix! For only $5/month, the Enthusiast Plan lets users support Streetmix while also gaining access to new experimental features. Plus your avatar gets a neat badge!'

const UpgradeDialog = ({ userId, roles }) => {
  const intl = useIntl()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const hasTier1 = roles.includes(userRoles.SUBSCRIBER_1.value)

  async function onToken (token) {
    const requestBody = { userId, token }

    setLoading(true)
    try {
      const { data } = await axios.post('/services/pay', requestBody)
      setData(data)
    } catch (err) {
      setError(err)
    }
    setLoading(false)
  }

  const stripeName = intl.formatMessage({
    id: 'upgrade.name',
    defaultMessage: 'Streetmix Enthusiast Plan'
  })
  const stripeDescription = intl.formatMessage({
    id: 'upgrade.description',
    defaultMessage: 'stripe description goes here'
  })
  const stripeLabel = intl.formatMessage({
    id: 'upgrade.label',
    defaultMessage: 'Subscribe'
  })

  let activePanel
  if (hasTier1) {
    activePanel = (
      <p>
        <FormattedMessage id="upgrade.hasTier1" defaultMessage="Thanks for supporting Streetmix!" />
      </p>)
  } else if (loading) {
    activePanel = (
      <p>
        <FormattedMessage id="upgrade.loading" defaultMessage="Loading..." />
      </p>)
  } else if (error) {
    activePanel = (
      <p>
        <FormattedMessage id="upgrade.error" defaultMessage="We encountered an error:" />
        {error}
      </p>)
  } else if (data) {
    activePanel = (
      <p>
        <FormattedMessage id="upgrade.success" defaultMessage="Thank you! Please refresh this page to see your upgrades." />
      </p>)
  } else {
    activePanel = (<React.Fragment>
      <p>
        <FormattedMessage id="upgrade.body" defaultMessage={DEFAULT_BODY} />
      </p>
      <StripeCheckout
        amount={500}
        name={stripeName}
        description={stripeDescription}
        label={stripeLabel}
        locale="auto"
        stripeKey={STRIPE_API_KEY}
        token={onToken}
        zipCode
      />
    </React.Fragment>)
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="upgrade-dialog" dir="ltr">
          <header>
            <h1>
              <FormattedMessage id="upgrade.title" defaultMessage="Upgrade" />
            </h1>
          </header>
          {activePanel}
        </div>
      )}
    </Dialog>
  )
}

function mapStateToProps (state) {
  const { userId } = state.user.signInData || {}
  const roles = state.user.profileCache ? state.user.profileCache[userId].roles : []
  return {
    userId,
    roles
  }
}

UpgradeDialog.propTypes = {
  userId: PropTypes.string.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default connect(mapStateToProps)(UpgradeDialog)
