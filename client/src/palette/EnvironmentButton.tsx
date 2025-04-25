import React from 'react'
import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'

import { toggleToolbox } from '../store/slices/ui'
import Button from '../ui/Button'
import Icon from '../ui/Icon'
import Tooltip from '../ui/Tooltip'

function EnvironmentButton (): React.ReactElement {
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleClickTools (): void {
    dispatch(toggleToolbox())
  }

  const label = intl.formatMessage({
    id: 'tools.skybox.tooltip',
    defaultMessage: 'Environment editor'
  })

  return (
    <Tooltip label={label}>
      <Button onClick={handleClickTools}>
        <Icon name="sun" />
      </Button>
    </Tooltip>
  )
}

export default EnvironmentButton
