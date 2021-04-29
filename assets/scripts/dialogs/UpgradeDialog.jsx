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
    // Default: begin upgrade journey with patreon
    activePanel = (
      <>
        <div className="dialog-content">
          <div className="upgrade-dialog-content">
            <div className="upgrade-dialog-left">
              <header>
                <h2>
                  <FormattedMessage
                    id="upgrade.header"
                    defaultMessage="Streetmix PLUS"
                  />
                </h2>
                <p role="subtitle">
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
                    id="upgrade.feature.discord"
                    defaultMessage="Subscriber-only Discord community"
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="upgrade.teaser.more"
                    defaultMessage="More to come! "
                  />
                  <a href="">
                    <FormattedMessage
                      id="upgrade.teaser.help"
                      defaultMessage="Help us"
                    />
                  </a>
                  <FormattedMessage
                    id="upgrade.teaser.prioritise"
                    defaultMessage=" prioritise future features!"
                  />
                </li>
              </ul>
            </div>
            <div className="upgrade-dialog-right">
              <p>
                <FormattedMessage
                  id="upgrade.support"
                  defaultMessage="Support Streetmix for $10 per month, and gain access additional Streetmix Plus features!"
                />
              </p>
              <p>
                <FormattedMessage
                  id="upgrade.cost"
                  defaultMessage="By selecting upgrade you will be directed to Patreon to authorise Streetmix application with Patreon."
                />
              </p>
              <p>
                <strong>
                  <FormattedMessage
                    id="upgrade.cost"
                    defaultMessage="$10 USD / MONTH"
                  />
                </strong>
              </p>

              <div>
                <button id="=patreon-btn" onClick={goToPatreon}>
                  <FormattedMessage
                    id="upgrade.patreon-btn"
                    defaultMessage="Upgrade"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="upgrade-dialog" dir="ltr">
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
