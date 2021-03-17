/**
 * Feature flags (dialog box)
 *
 * Secret menu.
 *
 */
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Dialog from './Dialog'
import Checkbox from '../ui/Checkbox'
import FEATURE_FLAGS from '../../../app/data/flags'
import { setFeatureFlag } from '../store/slices/flags'
import './FeatureFlagDialog.scss'

function FeatureFlagDialog (props) {
  const flags = useSelector((state) => state.flags)
  const dispatch = useDispatch()

  function renderFlagList () {
    return Object.entries(FEATURE_FLAGS).map((item) => {
      const id = item[0]
      const deets = item[1]
      const htmlLabel = `feature-flag__input--${id
        .toLowerCase()
        .replace(/_/g, '-')}`

      // Bail if a defined flag is not in the store (e.g. in tests with mock stores)
      if (!flags[id]) return null

      // If the setting has changed, display it differently
      const isNotDefault = deets.defaultValue !== flags[id].value
      const labelClassName = isNotDefault ? 'feature-flag-label-modified' : ''

      return (
        <li key={id}>
          <Checkbox
            id={htmlLabel}
            onChange={(event) => {
              dispatch(
                setFeatureFlag({
                  flag: id,
                  value: event.target.checked
                })
              )
            }}
            checked={flags[id].value}
            disabled={deets.enabled === false}
          >
            <span className={labelClassName}>{deets.label}</span>
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
