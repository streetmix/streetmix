import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { setFeatureFlag } from '../../store/slices/flags'
import Switch from '../../ui/Switch'
import UnitSettings from './UnitSettings'
import SettingPopover from './SettingPopover'

function GeneralSettings (props) {
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
function SillyClownSetting (props) {
  const flag = useSelector((state) => state.flags.SILLY_CLOWNS)
  const dispatch = useDispatch()

  function handleCheckedChange (checked) {
    dispatch(
      setFeatureFlag({
        flag: 'SILLY_CLOWNS',
        value: checked
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
      <SettingPopover>
        <FormattedMessage
          id="settings.misc.silly-clowns-description"
          defaultMessage="Enables Easter eggs."
        />
      </SettingPopover>
    </div>
  )
}

export default GeneralSettings
