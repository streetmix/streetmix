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
        <FormattedMessage
          id="upgrade.hasTier1"
          defaultMessage="Thanks for supporting Streetmix!"
        />
      </p>
    )
  } else if (loading) {
    activePanel = (
      <p>
        <FormattedMessage id="upgrade.loading" defaultMessage="Loading..." />
      </p>
    )
  } else if (error) {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.error"
          defaultMessage="We encountered an error:"
        />
        {error}
      </p>
    )
  } else if (data) {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.success"
          defaultMessage="Thank you! Please refresh this page to see your upgrades."
        />
      </p>
    )
  } else {
    activePanel = (
      <>
        <StripeCheckout
          amount={500}
          name={stripeName}
          description={stripeDescription}
          label={stripeLabel}
          locale="auto"
          stripeKey={STRIPE_API_KEY}
          token={onToken}
          zipCode={true}
        />
      </>
    )
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="upgrade-dialog">
          {/* <header>
            <h1>
              <FormattedMessage id="upgrade.title" defaultMessage="Upgrade" />
            </h1>
          </header> */}
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              {/* <div className="upgrade-dialog-left"> */}
              <div>
                <header>
                  <h2>
                    <FormattedMessage
                      id="upgrade.header"
                      defaultMessage="Upgrade to Streetmix +"
                    />
                  </h2>
                  <p role="doc-subtitle">
                    <FormattedMessage
                      id="upgrade.exciter"
                      defaultMessage="For individuals that want to support and get new features"
                    />
                  </p>
                </header>
                <ul>
                  <li>
                    <FormattedMessage
                      id="upgrade.feature.segment"
                      defaultMessage="Rename street segments"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="upgrade.feature.background"
                      defaultMessage="Change background / environment"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="upgrade.feature.export"
                      defaultMessage="Export images and a higher resolution and without watermark"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="upgrade.feature.subscriber"
                      defaultMessage="Subscriber-only"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="upgrade.teaser.discord"
                      defaultMessage="Discord community"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="upgrade.teaser.more"
                      defaultMessage="And more to come!"
                    />
                  </li>
                  <li>
                    <FormattedMessage
                      id="upgrade.teaser.prioritise"
                      defaultMessage="Help us prioritise future features!"
                    />
                  </li>
                </ul>
                <p>
                  <strong>
                    <FormattedMessage
                      id="upgrade.cost"
                      defaultMessage="$10 USD / MONTH"
                    />
                  </strong>
                </p>
              </div>
            </div>
            {activePanel}
          </div>
        </div>
      )}
    </Dialog>
  )
}

function mapStateToProps (state) {
  const { userId } = state.user.signInData || {}
  const roles = state.user.profileCache
    ? state.user.profileCache[userId].roles
    : []
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
