import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import ExternalLink from '../ui/ExternalLink'
import { trackEvent } from '../app/event_tracking'

function handleClickDonate () {
  trackEvent(
    'INTERACTION',
    '[Contribute menu] Donate link clicked',
    null,
    null,
    false
  )
}

function ContributeMenu (props) {
  return (
    <Menu {...props}>
      <ExternalLink
        href="https://opencollective.com/streetmix/"
        onClick={handleClickDonate}
      >
        <FormattedMessage id="menu.contribute.donate" defaultMessage="Donate" />
      </ExternalLink>
    </Menu>
  )
}

export default ContributeMenu
