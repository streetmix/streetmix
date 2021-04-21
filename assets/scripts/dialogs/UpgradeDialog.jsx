import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import userRoles from '../../../app/data/user_roles.json'
import Dialog from './Dialog'
import './UpgradeDialog.scss'
import {
  LSKEY_PATREON_SIGNIN_STATE,
  LSKEY_CONTINUE_PAYMENT_STATE,
  LSKEY_PROMPT_UPGRADE
} from '../app/constants'
import { doSignInForUpgrade } from '../users/authentication'
import { SignInToUpgradeButton } from '../menus/SignInButton'

const DEFAULT_BODY =
  'Thank you for using Streetmix! For only $5/month, the Enthusiast Plan lets users support Streetmix while also gaining access to new experimental features. Plus your avatar gets a neat badge!'
const PATREON_RETURN_NO_SUBSCRIPTION = 'no subscription - go over here'

const UpgradeDialog = ({ userId, roles }) => {
  const [isReturningUser] = useState(isReturningFromPatreon())
  const [hasPatreonError] = useState(isReturningFailedToAuthorise())
  const [continueUpgrade] = useState(isReturningFromSignin())

  const hasTier1 = roles.includes(userRoles.SUBSCRIBER_1.value)

  window.localStorage.removeItem(LSKEY_PATREON_SIGNIN_STATE)
  window.localStorage.removeItem(LSKEY_CONTINUE_PAYMENT_STATE)
  window.localStorage.removeItem(LSKEY_PROMPT_UPGRADE)

  const goToPatreon = () => {
    window.location.href = '/services/integrations/patreon'
  }

  let activePanel
  // not logged in yet
  if (userId === '') {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.hasTier1"
          defaultMessage="go sign in first"
        />
        <SignInToUpgradeButton onClick={doSignInForUpgrade} />
      </p>
    )
  } else if (continueUpgrade) {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.patreonError"
          defaultMessage="you signed in yay, now upgrade"
        />
      </p>
    )
  } else if (hasPatreonError) {
    activePanel = (
      <p>
        <FormattedMessage id="upgrade.patreonError" defaultMessage="oh no" />
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

export function isReturningFromPatreon () {
  const localSetting = window.localStorage[LSKEY_PATREON_SIGNIN_STATE]
  return localSetting != null
}

export function isReturningFailedToAuthorise () {
  const localSetting = window.localStorage[LSKEY_PATREON_SIGNIN_STATE]
  return localSetting === 'error'
}

export function isReturningFromSignin () {
  const localSetting = window.localStorage[LSKEY_CONTINUE_PAYMENT_STATE]
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
