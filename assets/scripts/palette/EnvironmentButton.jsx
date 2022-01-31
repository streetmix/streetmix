import React from 'react'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import Tooltip from '../ui/Tooltip'
import Icon from '../ui/Icon'
import { toggleToolbox } from '../store/slices/ui'

function EnvironmentButton (props) {
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleClickTools () {
    dispatch(toggleToolbox())
  }

  const label = intl.formatMessage({
    id: 'tools.environment.tooltip',
    defaultMessage: 'Environment editor'
  })

  return (
    <Tooltip label={label}>
      {/* Keep title on button to be queryable by test */}
      <button onClick={handleClickTools} title={label}>
        <Icon icon="sun" />
      </button>
    </Tooltip>
  )
}

export default React.memo(EnvironmentButton)
