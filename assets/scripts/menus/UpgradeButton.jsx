import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import Button from '../ui/Button'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import './UpgradeButton.scss'

function UpgradeButton ({ onClick = () => {} }) {
  return (
    <Button tertiary={true} className="menu-upgrade" onClick={onClick}>
      <img
        className="menu-avatar-subscriber"
        src={streetmixPlusIcon}
        alt="Streetmix+"
      />
      <FormattedMessage
        id="menu.item.streetmix-plus"
        defaultMessage="Get Streetmix+&lrm;"
      />
    </Button>
  )
}

UpgradeButton.propTypes = {
  onClick: PropTypes.func
}

export default UpgradeButton
