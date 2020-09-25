import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tooltip from '../ui/Tooltip'
import CloseButton from '../ui/CloseButton'
import { ICON_TOOLS } from '../ui/icons'
import { toggleToolbox } from '../store/slices/ui'
import './EnvironmentButton.scss'

function EnvironmentButton (props) {
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

  const label = intl.formatMessage({
    id: 'tools.tooltip',
    defaultMessage: 'Toggle tools'
  })

  const Button = (
    <Tooltip label={label}>
      {/* Keep title on button to be queryable by test */}
      <button onClick={handleClickTools} title={label}>
        <FontAwesomeIcon icon={ICON_TOOLS} />
      </button>
    </Tooltip>
  )

  // TODO: This was created and named before we had generalized <Tooltip>
  // UI elements. The "tooltip" variable and class naming is deprecated. If
  // we want to reuse this UI, let's name it something else ("popup"?) later.
  const TutorialPopup = tooltip ? (
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
    <>
      {Button}
      {TutorialPopup}
    </>
  )
}

export default React.memo(EnvironmentButton)
