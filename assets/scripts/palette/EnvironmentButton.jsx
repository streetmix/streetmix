import React from 'react'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import Tooltip from '../ui/Tooltip'
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
      <Button onClick={handleClickTools} title={label}>
        <Icon icon="sun" />
      </Button>
    </Tooltip>
  )
}

export default React.memo(EnvironmentButton)
