import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_LOCK } from '../ui/icons'
import Button from '../ui/Button'
import './StreetmixPlusPrompt.scss'

function StreetmixPlusPrompt ({ children }) {
  function handleClickUpgrade (event) {
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
        <FontAwesomeIcon icon={ICON_LOCK} />
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

StreetmixPlusPrompt.propTypes = {
  children: PropTypes.node
}

export default StreetmixPlusPrompt
