import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { setFeatureFlag } from '~/src/store/slices/flags.js'
import { Checkbox } from '~/src/ui/Checkbox.js'
import { Dialog } from '../Dialog.js'
import './FeatureFlagDialog.css'

export function FeatureFlagDialog() {
  const flags = useSelector((state) => state.flags)
  const dispatch = useDispatch()

  function renderFlagList(): React.ReactElement[] {
    return Object.entries(flags).map(([key, flag]) => {
      // If the setting has changed, display it differently
      const isNotDefault = flag.defaultValue !== flag.value
      const labelClassName = isNotDefault ? 'feature-flag-label-modified' : ''

      return (
        <li key={key}>
          <Checkbox
            onChange={(event) => {
              dispatch(
                setFeatureFlag({
                  flag: key,
                  value: event.target.checked,
                })
              )
            }}
            checked={flags[key].value}
            disabled={flag.enabled === false}
          >
            <span className={labelClassName}>{flag.label}</span>
          </Checkbox>
        </li>
      )
    })
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="feature-flag-dialog" dir="ltr">
          <header>
            <h1>Feature flags</h1>
          </header>
          <div className="dialog-content">
            <ul>{renderFlagList()}</ul>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            Close
          </button>
        </div>
      )}
    </Dialog>
  )
}
