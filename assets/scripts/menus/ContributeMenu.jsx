import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import ExternalLink from '../ui/ExternalLink'

function ContributeMenu (props) {
  return (
    <Menu {...props}>
      <ExternalLink href="https://opencollective.com/streetmix/">
        <FormattedMessage id="menu.contribute.donate" defaultMessage="Donate" />
      </ExternalLink>
    </Menu>
  )
}

export default ContributeMenu
