import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import userRoles from '../../../app/data/user_roles.json'
import Dialog from './Dialog'
import './UpgradeDialog.scss'
import { LOCAL_STORAGE_PATREON_SIGNIN_STATE } from '../app/constants'

const DEFAULT_BODY =
  'Thank you for using Streetmix! For only $5/month, the Enthusiast Plan lets users support Streetmix while also gaining access to new experimental features. Plus your avatar gets a neat badge!'
const PATREON_RETURN_NO_SUBSCRIPTION = 'no subscription - go over here'

const UpgradeDialog = ({ userId, roles }) => {
  const [isReturningUser] = useState(isReturningSignedInToPatreon())

  const hasTier1 = roles.includes(userRoles.SUBSCRIBER_1.value)

  window.localStorage[LOCAL_STORAGE_PATREON_SIGNIN_STATE] = null

  const goToPatreon = () => {
    window.location.href = '/services/integrations/patreon'
  }

  let activePanel
  // not logged in yets
  if (userId === '') {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.hasTier1"
          defaultMessage="go sign in first"
        />
      </p>
    )
  } else if (hasTier1 && isReturningUser) {
    // subscription successful
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.hasTier1"
          defaultMessage="Thanks for supporting Streetmix!"
        />
      </p>
    )
  } else if (hasTier1) {
    // already a subscriber
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.hasTier1"
          defaultMessage="You are already suscribed what else do you wanna do?"
        />
      </p>
    )
  } else if (isReturningUser) {
    // authorised but
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.upgradeNoCampaign"
          defaultMessage={PATREON_RETURN_NO_SUBSCRIPTION}
        />
      </p>
    )
  } else {
    // begin the journey
    activePanel = (
      <>
        <p>
          <FormattedMessage id="upgrade.body" defaultMessage={DEFAULT_BODY} />
        </p>

        <button id="patreon-btn" onClick={goToPatreon}>
          Upgrade
        </button>
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

export function isReturningSignedInToPatreon () {
  const localSetting = window.localStorage[LOCAL_STORAGE_PATREON_SIGNIN_STATE]
  // todo: modernise
  return localSetting === 'true'
}

function mapStateToProps (state) {
  const { userId } = state.user.signInData || { userId: '' }
  const { roles } = (userId && state.user.profileCache[userId]) || { roles: [] }

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
