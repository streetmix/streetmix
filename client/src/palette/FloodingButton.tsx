import { useDispatch } from 'react-redux'
import { useIntl } from 'react-intl'

import { toggleCoastalFloodingPanel } from '~/src/store/slices/coastmix.js'
import { Button } from '../ui/Button.js'
import { Icon } from '../ui/Icon.js'
import { Tooltip } from '../ui/Tooltip.js'

export function FloodingButton() {
  const dispatch = useDispatch()
  const intl = useIntl()

  function handleClickTools(): void {
    dispatch(toggleCoastalFloodingPanel())
  }

  const label = intl.formatMessage({
    id: 'tools.flooding.tooltip',
    defaultMessage: 'Coastal flooding controls',
  })

  return (
    <Tooltip label={label} role="label">
      <Button onClick={handleClickTools} aria-label={label}>
        <Icon name="boat" size="24" />
      </Button>
    </Tooltip>
  )
}
