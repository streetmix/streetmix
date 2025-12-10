import React from 'react'
import { FormattedMessage } from 'react-intl'

import streetmixPlusIcon from 'url:../ui/icons/streetmix-plus.svg'
import { Button } from '../ui/Button'
import './UpgradeButton.css'

function UpgradeButton(): React.ReactElement {
  function handleClickUpgrade(): void {
    // dispatch(showDialog('UPGRADE'))
    window.open(
      'https://docs.streetmix.net/user-guide/streetmix-plus',
      '_blank'
    )
  }

  return (
    <Button tertiary className="menu-upgrade" onClick={handleClickUpgrade}>
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
