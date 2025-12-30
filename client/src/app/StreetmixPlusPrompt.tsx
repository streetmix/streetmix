import { FormattedMessage } from 'react-intl'

import { Button } from '../ui/Button.js'
import Icon from '../ui/Icon.js'
import './StreetmixPlusPrompt.css'

interface StreetmixPlusPromptProps {
  children: React.ReactNode
}

export function StreetmixPlusPrompt({ children }: StreetmixPlusPromptProps) {
  function handleClickUpgrade(event: React.MouseEvent) {
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
