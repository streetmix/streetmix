import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setFeatureFlag } from '~/src/store/slices/flags.js'
import { Switch } from '~/src/ui/Switch.js'

export function FeatureFlagSettings() {
  const flags = useSelector((state) => state.flags)
  const dispatch = useDispatch()

  function renderFlagList(): React.ReactElement[] {
    return Object.entries(flags).map(([key, flag]) => {
      // If the setting has changed, display it differently
      const isNotDefault = flag.defaultValue !== flag.value
      const labelClassName = isNotDefault ? 'feature-flag-label-modified' : ''

      return (
        <div className="settings-item" key={key}>
          <Switch
            onCheckedChange={(checked) => {
              dispatch(
                setFeatureFlag({
                  flag: key,
                  value: checked,
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
