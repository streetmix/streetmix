import React from 'react'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { setFeatureFlag } from '~/src/store/slices/flags'
import Switch from '~/src/ui/Switch'

function FeatureFlagSettings (): React.ReactElement {
  const flags = useSelector((state) => state.flags)
  const dispatch = useDispatch()

  function renderFlagList (): React.ReactElement[] {
    return Object.entries(flags).map(([key, flag]) => {
      const slugifyKey = key.toLowerCase().replace(/_/g, '-')
      const htmlLabel = `feature-flag__input--${slugifyKey}`

      // If the setting has changed, display it differently
      const isNotDefault = flag.defaultValue !== flag.value
      const labelClassName = isNotDefault ? 'feature-flag-label-modified' : ''

      return (
        <div className="settings-item" key={key}>
          <Switch
            id={htmlLabel}
            onCheckedChange={(checked) => {
              dispatch(
                setFeatureFlag({
                  flag: key,
                  value: checked
                })
              )
            }}
            checked={flags[key].value}
            disabled={flag.enabled === false}
          >
            <span className={labelClassName}>{flag.label}</span>
          </Switch>
        </div>
      )
    })
  }

  return (
    <>
      <h2>Feature flags</h2>
      <p>
        Feature flags are administrator-level settings that can adjust or toggle
        Streetmix functionality. They can change at any time. Use at your own
        risk.
      </p>
      <hr />
      {renderFlagList()}
    </>
  )
}

export default FeatureFlagSettings
