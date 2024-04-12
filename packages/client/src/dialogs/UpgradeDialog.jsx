import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import axios from 'axios'
import userRoles from '../../../../app/data/user_roles.json'
import Dialog from './Dialog'
import './UpgradeDialog.scss'

const DEFAULT_BODY =
  'Thank you for using Streetmix! For only $5/month, the Enthusiast Plan lets users support Streetmix while also gaining access to new experimental features. Plus your avatar gets a neat badge!'

const UpgradeDialog = ({ userId, roles }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const hasTier1 = roles.includes(userRoles.SUBSCRIBER_1.value)

  // eslint-disable-next-line
  async function onToken(token) {
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
        <p>
          <FormattedMessage id="upgrade.body" defaultMessage={DEFAULT_BODY} />
        </p>
      </>
    )
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
  const roles = state.user.signInData?.details?.roles || []

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
