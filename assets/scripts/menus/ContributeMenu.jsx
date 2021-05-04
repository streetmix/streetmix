import React from 'react'
import { FormattedMessage } from 'react-intl'
import ExternalLink from '../ui/ExternalLink'
import Menu from './Menu'

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
