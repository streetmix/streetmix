/**
 * Feature flags (dialog box)
 *
 * Secret menu.
 *
 */
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Checkbox from '../ui/Checkbox'
import { setFeatureFlag } from '../store/slices/flags'
import Dialog from './Dialog'
import './FeatureFlagDialog.scss'

function FeatureFlagDialog (props) {
  const flags = useSelector((state) => state.flags)
  const dispatch = useDispatch()

  function renderFlagList () {
    return Object.entries(flags).map(([key, flag]) => {
      const slugifyKey = key.toLowerCase().replace(/_/g, '-')
      const htmlLabel = `feature-flag__input--${slugifyKey}`

      // If the setting has changed, display it differently
      const isNotDefault = flag.defaultValue !== flag.value
      const labelClassName = isNotDefault ? 'feature-flag-label-modified' : ''

      return (
        <li key={key}>
          <Checkbox
            id={htmlLabel}
            onChange={(event) => {
              dispatch(
                setFeatureFlag({
                  flag: key,
                  value: event.target.checked
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

export default FeatureFlagDialog
