import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import CloseButton from '../ui/CloseButton'
import { ICON_TOOLS } from '../ui/icons'
import { toggleToolbox } from '../store/slices/ui'
import './PaletteCommandsLeft.scss'

function PaletteCommandsLeft (props) {
  const enable = useSelector((state) => state.flags.ENVIRONMENT_EDITOR.value)
  const dispatch = useDispatch()
  const intl = useIntl()

  let tooltipDismissed
  try {
    tooltipDismissed = window.localStorage.getItem(
      'new-palette-tooltip-dismissed'
    )
  } catch (e) {
    console.log('Could not access localstorage')
  }

  const [tooltip, setTooltip] = useState(tooltipDismissed !== 'true')

  function handleClickTools () {
    handleDismissTooltip()
    dispatch(toggleToolbox())
  }

  function handleDismissTooltip () {
    setTooltip(false)

    try {
      window.localStorage.setItem('new-palette-tooltip-dismissed', 'true')
    } catch (error) {
      console.error('Could not access localstorage', error)
    }
  }

  if (!enable) return null

  const Button = (
    <button
      onClick={handleClickTools}
      title={intl.formatMessage({
        id: 'tools.tooltip',
        defaultMessage: 'Toggle tools'
      })}
    >
      <FontAwesomeIcon icon={ICON_TOOLS} />
    </button>
  )

  const Tooltip = tooltip ? (
    <div className="supermoon-tooltip">
      <CloseButton onClick={handleDismissTooltip} />
      <p>
        <strong>You’ve got some new tools!&lrm;</strong> Click on this button to
        activate some new abilities.&lrm;
      </p>
      <div className="palette-tooltip-pointer-container">
        <div className="palette-tooltip-pointer" />
      </div>
    </div>
  ) : null

  return (
    <div className="palette-commands-left">
      {Button}
      {Tooltip}
    </div>
  )
}

export default React.memo(PaletteCommandsLeft)
