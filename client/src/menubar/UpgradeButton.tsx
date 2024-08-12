import React from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../ui/Button'
import streetmixPlusIcon from '../ui/icons/streetmix-plus.svg'
import './UpgradeButton.css'

interface UpgradeButtonProps {
  onClick: () => void
}

function UpgradeButton ({
  onClick = () => undefined
}: UpgradeButtonProps): React.ReactElement {
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

export default UpgradeButton
