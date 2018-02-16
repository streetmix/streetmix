/**
 * Dialog (class)
 *
 * Generic class instance of dialog
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { t } from '../app/locale'

export default class Dialog extends React.PureComponent {
  static propTypes = {
    closeDialog: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    disableShieldExit: PropTypes.bool
  }

  static defaultProps = {
    className: '',
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

    return (
      <div className="dialog-box-container" ref={(ref) => { this.dialogEl = ref }}>
        <div className={shieldClassName} onClick={this.onClickShield} />
        {this.state.error ? (
          <div className="dialog-box dialog-error">
            <h1>{t('dialogs.error.heading', 'Oops!')}</h1>
            <p>
              {t('dialogs.error.text', 'Something unexpected happened 😢, please try again.')}
            </p>
            <p style={{ textAlign: 'center' }}>
              <button onClick={this.props.closeDialog} title={t('btn.close', 'Close')}>
                {t('btn.close', 'Close')}
              </button>
            </p>
          </div>
        ) : (
          <div className="dialog-box">
            <button
              className="close"
              onClick={this.props.closeDialog}
              title={t('btn.close', 'Close')}
            >
              ×
            </button>
            {React.cloneElement(this.props.children, { closeDialog: this.props.closeDialog })}
          </div>
        )}
      </div>
    )
  }
}
