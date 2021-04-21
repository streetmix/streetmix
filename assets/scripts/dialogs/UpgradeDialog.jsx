import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import userRoles from '../../../app/data/user_roles.json'
import Dialog from './Dialog'
import './UpgradeDialog.scss'

const LOCAL_STORAGE_PATREON_SIGNIN_STATE = 'patreon-signin-state'
const DEFAULT_BODY =
  'Thank you for using Streetmix! For only $5/month, the Enthusiast Plan lets users support Streetmix while also gaining access to new experimental features. Plus your avatar gets a neat badge!'
const PATREON_RETURN_NO_SUBSCRIPTION = 'no subscription - go over here'

const UpgradeDialog = ({ userId, roles }) => {
  // const [loading, setLoading] = useState(false)
  // const [error, setError] = useState(null)
  // const [data, setData] = useState(null)
  const isReturningUser = useState(isReturningSignedInToPatreon())
  // const dispatch = useDispatch()

  const hasTier1 = roles.includes(userRoles.SUBSCRIBER_1.value)

  setIsReturningSignedInToPatreon('false')

  const goToPatreon = () => {
    // TODO: dispatch to store

    // dispatch(updatePatreonClickState(true))
    setIsReturningSignedInToPatreon('true')
    window.location.href = '/services/integrations/patreon'
  }

  // async function onToken (token) {
  //   const requestBody = { userId, token }

  //   setLoading(true)
  //   try {
  //     const { data } = await axios.post('/services/pay', requestBody)
  //     setData(data)
  //   } catch (err) {
  //     setError(err)
  //   }
  //   setLoading(false)
  // }

  let activePanel
  // Subscription successful
  if (hasTier1) {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.hasTier1"
          defaultMessage="Thanks for supporting Streetmix!"
        />
      </p>
    )
  } else if (isReturningUser) {
    activePanel = (
      <p>
        <FormattedMessage
          id="upgrade.upgradeNoCampaign"
          defaultMessage={PATREON_RETURN_NO_SUBSCRIPTION}
        />
      </p>
    )
    // } else if (loading) {
    //   activePanel = (
    //     <p>
    //       <FormattedMessage id="upgrade.loading" defaultMessage="Loading..." />
    //     </p>
    //   )
    // } else if (error) {
    //   activePanel = (
    //     <p>
    //       <FormattedMessage
    //         id="upgrade.error"
    //         defaultMessage="We encountered an error:"
    //       />
    //       {error}
    //     </p>
    //   )
    // } else if (data) {
    //   activePanel = (
    //     <p>
    //       <FormattedMessage
    //         id="upgrade.success"
    //         defaultMessage="Thank you! Please refresh this page to see your upgrades."
    //       />
    //     </p>
    //   )
  } else {
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

function setIsReturningSignedInToPatreon (value) {
  window.localStorage[LOCAL_STORAGE_PATREON_SIGNIN_STATE] = value
}

export function isReturningSignedInToPatreon () {
  const localSetting = window.localStorage[LOCAL_STORAGE_PATREON_SIGNIN_STATE]
  // todo: modernise
  return localSetting === 'true'
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
