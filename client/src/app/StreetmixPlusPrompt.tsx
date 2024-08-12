import React from 'react'
import { FormattedMessage } from 'react-intl'

import Button from '../ui/Button'
import Icon from '../ui/Icon'
import './StreetmixPlusPrompt.css'

interface StreetmixPlusPromptProps {
  children: React.ReactNode
}

function StreetmixPlusPrompt ({
  children
}: StreetmixPlusPromptProps): React.ReactElement {
  function handleClickUpgrade (event: React.MouseEvent): void {
    event.preventDefault()
    // dispatch(showDialog('UPGRADE'))
    window.open(
      'https://docs.streetmix.net/user-guide/streetmix-plus',
      '_blank'
    )
  }

  return (
    <>
      <div className="streetmix-plus-locked-banner">
        <Icon name="lock" />
        <FormattedMessage id="plus.locked.label" defaultMessage="Locked" />
      </div>
      {children}
      <div className="streetmix-plus-prompt">
        <Button onClick={handleClickUpgrade}>
          <FormattedMessage
            id="plus.locked.action"
            defaultMessage="Get Streetmix+&lrm;"
          />
        </Button>
      </div>
    </>
  )
}

export default StreetmixPlusPrompt
