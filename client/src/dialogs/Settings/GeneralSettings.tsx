import { FormattedMessage } from 'react-intl'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setFeatureFlag } from '~/src/store/slices/flags.js'
import { Popover } from '~/src/ui/Popover.js'
import { Switch } from '~/src/ui/Switch.js'
import { AppearanceSettings } from './AppearanceSettings.js'
import { UnitSettings } from './UnitSettings.js'

export function GeneralSettings() {
  const flags = useSelector((state) => state.flags)

  return (
    <>
      <section>
        <h2>
          <FormattedMessage
            id="settings.general.label"
            defaultMessage="General"
          />
        </h2>
        <hr />
      </section>

      <UnitSettings />

      {/* This might be a new side panel when we have more settings */}
      {flags.COLOR_MODE_TOGGLE.value && <AppearanceSettings />}

      <section>
        <h2>
          <FormattedMessage
            id="settings.misc.label"
            defaultMessage="Miscellaneous"
          />
        </h2>
        <SillyClownSetting />
      </section>
    </>
  )
}

/**
 * Silly clowns is a feature flag that is also now user-editable.
 */
function SillyClownSetting(): React.ReactElement {
  const flag = useSelector((state) => state.flags.SILLY_CLOWNS)
  const dispatch = useDispatch()

  function handleCheckedChange(checked: boolean): void {
    dispatch(
      setFeatureFlag({
        flag: 'SILLY_CLOWNS',
        value: checked,
      })
    )
  }

  return (
    <div className="settings-item">
      <Switch onCheckedChange={handleCheckedChange} checked={flag.value}>
        <FormattedMessage
          id="settings.misc.silly-clowns"
          defaultMessage="Silly clowns"
        />
      </Switch>
      <Popover>
        <FormattedMessage
          id="settings.misc.silly-clowns-description"
          defaultMessage="Enables Easter eggs."
        />
      </Popover>
    </div>
  )
}
