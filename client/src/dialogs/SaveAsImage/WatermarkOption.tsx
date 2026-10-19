import { FormattedMessage, useIntl } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { updateSettings } from '~/src/store/slices/settings.js'
import { Icon } from '~/src/ui/Icon.js'
import { Tooltip } from '~/src/ui/Tooltip.js'
import { Checkbox } from '~/src/ui/Checkbox.js'

export function WatermarkOption() {
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const watermark = useSelector((state) => state.settings.saveAsImageWatermark)
  const intl = useIntl()
  const dispatch = useDispatch()

  const toggleWatermark = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateSettings({ saveAsImageWatermark: event.target.checked }))
  }

  if (isSubscriber) {
    return (
      <Checkbox onChange={toggleWatermark} checked={watermark}>
        <FormattedMessage
          id="dialogs.save.option-watermark"
          defaultMessage="Watermark"
        />
      </Checkbox>
    )
  }

  return (
    <Tooltip
      label={intl.formatMessage({
        id: 'plus.locked.sub',
        // Default message ends with a Unicode-only left-right order mark
        // to allow for proper punctuation in `rtl` text direction
        // This character is hidden from editors by default!
        defaultMessage: 'Upgrade to Streetmix+ to use!‎',
      })}
    >
      <Checkbox onChange={toggleWatermark} checked={true} disabled={true}>
        <FormattedMessage
          id="dialogs.save.option-watermark"
          defaultMessage="Watermark"
        />
        &nbsp;
        <Icon name="lock" />
      </Checkbox>
    </Tooltip>
  )
}
