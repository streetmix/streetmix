/**
 * Dialog (class)
 *
 * Generic class instance of dialog
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape } from 'react-intl'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import CloseButton from '../ui/CloseButton'

export class Dialog extends React.PureComponent {
  static propTypes = {
    intl: intlShape.isRequired,
    closeDialog: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    disableShieldExit: PropTypes.bool
  }

  static defaultProps = {
    disableShieldExit: false
  }

  constructor (props) {
    super(props)

    this.state = {
      error: null
    }
  }

  componentDidMount () {
    // Set up keypress listener to close dialogs if open
    registerKeypress('esc', this.props.closeDialog)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.props.closeDialog)
  }

  componentDidCatch (error, info) {
    this.setState({
      error
    })
  }

  onClickShield = () => {
    if (!this.props.disableShieldExit) {
      this.props.closeDialog()
    }
  }

  render () {
    let shieldClassName = 'dialog-box-shield'
    if (this.props.disableShieldExit && !this.state.error) {
      shieldClassName += ' dialog-box-shield-unclickable'
    }

    const closeLabel = this.props.intl.formatMessage({ id: 'btn.close', defaultMessage: 'Close' })

    return (
      <div className="dialog-box-container" ref={(ref) => { this.dialogEl = ref }}>
        <div className={shieldClassName} onClick={this.onClickShield} />
        {this.state.error ? (
          <div className="dialog-box dialog-error">
            <h1><FormattedMessage id="dialogs.error.heading" defaultMessage="Oops!" /></h1>
            <p>
              <FormattedHTMLMessage id="dialogs.error.text" defaultMessage="Something unexpected happened 😢, please try again." />
            </p>
            <p style={{ textAlign: 'center' }}>
              <button onClick={this.props.closeDialog} title={closeLabel}>
                <FormattedMessage id="btn.close" defaultMessage="Close" />
              </button>
            </p>
          </div>
        ) : (
          <div className="dialog-box">
            <CloseButton onClick={this.props.closeDialog} title={closeLabel} />
            {React.cloneElement(this.props.children, { closeDialog: this.props.closeDialog })}
          </div>
        )}
      </div>
    )
  }
}

export default injectIntl(Dialog)
