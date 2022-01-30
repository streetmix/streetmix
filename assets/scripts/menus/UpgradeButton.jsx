import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import './UpgradeButton.scss'

UpgradeButton.propTypes = {
  onClick: PropTypes.func
}

function UpgradeButton ({ onClick = () => {} }) {
  return (
    <button className="menu-upgrade button-tertiary" onClick={onClick}>
      <img
        className="menu-avatar-badge menu-avatar-subscriber"
        src={streetmixPlusIcon}
        alt="Streetmix+"
      />
      <FormattedMessage
        id="menu.item.streetmix-plus"
        defaultMessage="Get Streetmix+&lrm;"
      />
    </button>
  )
}

export default UpgradeButton
