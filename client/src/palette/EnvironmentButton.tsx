import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'

import { toggleToolbox } from '../store/slices/ui.js'
import { Button } from '../ui/Button.js'
import Icon from '../ui/Icon.js'
import { Tooltip } from '../ui/Tooltip.js'

export function EnvironmentButton() {
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleClickTools(): void {
    dispatch(toggleToolbox())
  }

  const label = intl.formatMessage({
    id: 'tools.skybox.tooltip',
    defaultMessage: 'Environment editor',
  })

  return (
    <Tooltip label={label}>
      <Button onClick={handleClickTools} aria-label={label}>
        <Icon name="sun" />
      </Button>
    </Tooltip>
  )
}
