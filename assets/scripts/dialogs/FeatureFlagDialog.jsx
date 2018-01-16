/**
 * Feature flags (dialog box)
 *
 * Secret menu.
 * Instantiates an instance of Dialog
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Dialog from './Dialog'
import { FEATURE_FLAGS } from '../app/flag_data'
import { setFeatureFlag } from '../store/actions/flags'
import { clearDialogs } from '../store/actions/dialogs'

class FeatureFlagDialog extends React.Component {
  static propTypes = {
    flags: PropTypes.object.isRequired,
    setFeatureFlag: PropTypes.func.isRequired,
    clearDialogs: PropTypes.func.isRequired
  }

  renderFlagList = () => {
    return Object.entries(FEATURE_FLAGS).map((item) => {
      const id = item[0]
      const deets = item[1]
      const htmlLabel = `feature-flag__input--${id.toLowerCase().replace(/_/g, '-')}`
      const labelClassNames = []
      const isNotDefault = deets.defaultValue !== this.props.flags[id].value

      if (deets.disabled) {
        labelClassNames.push('feature-flag-label-disabled')
      }
      if (isNotDefault) {
        labelClassNames.push('feature-flag-label-modified')
      }

      return (
        <tr key={id}>
          <td>
            <input
              type="checkbox"
              onChange={(event) => {
                this.props.setFeatureFlag(id, event.target.checked)
              }}
              checked={this.props.flags[id].value}
              id={htmlLabel}
              disabled={deets.disabled}
            />
          </td>
          <td>
            <label htmlFor={htmlLabel} className={labelClassNames.join(' ')}>{deets.label}</label>
          </td>
        </tr>
      )
    })
  }

  render () {
    return (
      <Dialog className="feature-flag-dialog">
        <h1>Feature flags</h1>

        <table>
          <tbody>
            {this.renderFlagList()}
          </tbody>
        </table>

        <p>
          <button onClick={this.props.clearDialogs}>
            Close
          </button>
        </p>
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
    setFeatureFlag: (flag, value) => { dispatch(setFeatureFlag(flag, value)) },
    clearDialogs: () => { dispatch(clearDialogs()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeatureFlagDialog)
