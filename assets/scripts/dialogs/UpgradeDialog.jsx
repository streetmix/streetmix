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
import ExternalLink from '../ui/ExternalLink'

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
  // Header options
  const header = (
    <header>
      <h2>
        <FormattedMessage id="upgrade.header" defaultMessage="Streetmix PLUS" />
      </h2>
      <p role="subtitle">
        <FormattedMessage
          id="upgrade.exciter"
          defaultMessage="For individuals that want to support and get new features"
        />
      </p>
    </header>
  )
  const headerSupporter = (
    <header>
      <h2>
        <FormattedMessage
          id="upgrade.header-supporter"
          defaultMessage="Thanks for supporting Streetmix"
        />
      </h2>
      <p role="subtitle">
        <FormattedMessage
          id="upgrade.exciter-supporter"
          defaultMessage="As a Streetmix Plus supporter you have access to these features"
        />
      </p>
    </header>
  )
  // Right-hand panel
  const actionPanel = (
    <>
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
    </>
  )
  // Left-hand panel
  const benefitsPanel = (
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
          <FormattedMessage id="upgrade.teaser.help" defaultMessage="Help us" />
        </a>
        <FormattedMessage
          id="upgrade.teaser.prioritise"
          defaultMessage=" prioritise future features!"
        />
      </li>
    </ul>
  )

  // Upgrade: user not yet signed in, prompt to log in first
  if (userId === '') {
    activePanel = (
      <>
        <div className="upgrade-dialog-two-col" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <div className="upgrade-dialog-left">
                {header}
                {benefitsPanel}
              </div>
              <div className="upgrade-dialog-right">
                {actionPanel}
                <div>
                  <SignInToUpgradeButton onClick={doSignInForUpgrade} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
    // Upgrade: user has signed in, prompt them to continue upgrade
  } else if (continueUpgrade) {
    activePanel = (
      <>
        <div className="upgrade-dialog" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <header>
                <h2>
                  <FormattedMessage
                    id="upgrade.continue-upgrade.thanks"
                    defaultMessage="All signed-in!"
                  />
                </h2>
              </header>
              <p>
                <FormattedMessage
                  id="upgrade.continue-upgrade.continue"
                  defaultMessage="To continue upgrading you'll need to:"
                />
              </p>
              <ul>
                <li>
                  <FormattedMessage
                    id="upgrade.continue-upgrade.authorize"
                    defaultMessage="Authorize the Streetmix app with Patreon"
                  />
                </li>
                <li>
                  <FormattedMessage
                    id="upgrade.continue-upgrade.campaign"
                    defaultMessage="Subscribe to the Streetmix Patreon campaign"
                  />
                </li>
              </ul>
              <button id="=patreon-btn" onClick={goToPatreon}>
                <FormattedMessage
                  id="upgrade.patreon-btn-continue"
                  defaultMessage="Continue Upgrade"
                />
              </button>
            </div>
          </div>
        </div>
      </>
    )
    // Upgrade: there was an issue with Patreon
  } else if (hasPatreonError) {
    activePanel = (
      <>
        <div className="upgrade-dialog" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <header>
                <h2>
                  <FormattedMessage
                    id="upgrade.patreon-error.message"
                    defaultMessage="Oh, there was an issue with Patreon, and we aren't sure what happened"
                  />
                </h2>
              </header>
              <p>
                <FormattedMessage
                  id="upgrade.patreon-error.action"
                  defaultMessage="Please try upgrading again"
                />
              </p>
            </div>
          </div>
        </div>
      </>
    )
  } else if (hasTier1 && isReturningUser) {
    // Upgrade: subscription successful, thank everyone!
    activePanel = (
      <>
        <div className="upgrade-dialog" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <header>
                <h2>
                  <FormattedMessage
                    id="upgrade.hasTier1.thank-you"
                    defaultMessage="Thank you for supporting Streetmix!"
                  />
                </h2>
              </header>
            </div>
          </div>
        </div>
      </>
    )
  } else if (hasTier1) {
    // Upgrade: User is already a subscriber
    // Tell them what they have subscribed to and what they could do next
    activePanel = (
      <>
        <div className="upgrade-dialog-two-col" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <div className="upgrade-dialog-left">
                {headerSupporter}
                {benefitsPanel}
              </div>
              <div className="upgrade-dialog-right">
                <p>
                  <FormattedMessage
                    id="upgrade.support-more.explainer"
                    defaultMessage="Would you like to do more?"
                  />
                </p>
                <p>
                  <ExternalLink href="https://about.streetmix.net">
                    <FormattedMessage
                      id="upgrade.support-more.link"
                      defaultMessage="Contact us about partnerships!"
                    />
                  </ExternalLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  } else if (isReturningUser) {
    // Upgrade: User is authorised with Patreon
    // but not yet subscribed to the Streetmix campaign
    activePanel = (
      <>
        <div className="upgrade-dialog" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <header>
                <h2>
                  <FormattedMessage
                    id="upgrade.upgrade-no-campaign.thanks"
                    defaultMessage="Great! Thanks for authorizing the Streetmix app with Patreon!"
                  />
                </h2>
              </header>
              <p>
                <FormattedMessage
                  id="upgrade.upgrade-no-campaign.next-steps"
                  defaultMessage="The next step is to: "
                />
              </p>
              <ul>
                <li>
                  <ExternalLink href="https://www.patreon.com/streetmix">
                    <FormattedMessage
                      id="upgrade.upgrade-no-campaign.link"
                      defaultMessage=" subscribe to our Patreon campaign"
                    />
                  </ExternalLink>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </>
    )
  } else {
    // Upgrade default: begin the upgrade journey with Patreon
    activePanel = (
      <>
        <div className="upgrade-dialog-two-col" dir="ltr">
          <div className="dialog-content">
            <div className="upgrade-dialog-content">
              <div className="upgrade-dialog-left">
                {header}
                {benefitsPanel}
              </div>
              <div className="upgrade-dialog-right">
                {actionPanel}
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
        </div>
      </>
    )
  }

  return <Dialog>{(closeDialog) => <>{activePanel}</>}</Dialog>
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
