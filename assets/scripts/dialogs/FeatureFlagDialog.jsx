/**
 * Feature flags (dialog box)
 *
 * Secret menu.
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Dialog from './Dialog'
import FEATURE_FLAGS from '../../../app/data/flags'
import { setFeatureFlag } from '../store/actions/flags'
import './FeatureFlagDialog.scss'

class FeatureFlagDialog extends React.Component {
  static propTypes = {
    flags: PropTypes.object.isRequired,
    setFeatureFlag: PropTypes.func.isRequired
  }

  renderFlagList = () => {
    return Object.entries(FEATURE_FLAGS).map((item) => {
      const id = item[0]
      const deets = item[1]
      const htmlLabel = `feature-flag__input--${id.toLowerCase().replace(/_/g, '-')}`
      const labelClassNames = []

      // Bail if a defined flag is not in the store (e.g. in tests with mock stores)
      if (!this.props.flags[id]) return

      const isNotDefault = deets.defaultValue !== this.props.flags[id].value

      if (deets.enabled === false) {
        labelClassNames.push('feature-flag-label-disabled')
      }
      if (isNotDefault) {
        labelClassNames.push('feature-flag-label-modified')
      }

      return (
        <li key={id}>
          <input
            type="checkbox"
            onChange={(event) => {
              this.props.setFeatureFlag(id, event.target.checked)
            }}
            checked={this.props.flags[id].value}
            id={htmlLabel}
            disabled={deets.enabled === false}
          />
          <label htmlFor={htmlLabel} className={labelClassNames.join(' ')}>{deets.label}</label>
        </li>
      )
    })
  }

  render () {
    return (
      <Dialog>
        {(closeDialog) => (
          <div className="feature-flag-dialog">
            <header>
              <h1>Feature flags</h1>
            </header>
            <div className="dialog-content">
              <ul>
                {this.renderFlagList()}
              </ul>
            </div>
            <button className="dialog-primary-action" onClick={closeDialog}>
              Close
            </button>
          </div>
        )}
      </Dialog>
    )
  }
}

function mapStateToProps (state) {
  return {
    flags: state.flags
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setFeatureFlag: (flag, value) => { dispatch(setFeatureFlag(flag, value)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureFlagDialog)
