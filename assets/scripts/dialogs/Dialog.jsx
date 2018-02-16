/**
 * Dialog (class)
 *
 * Generic class instance of dialog
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import { clearDialogs } from '../store/actions/dialogs'
import { t } from '../app/locale'

class Dialog extends React.PureComponent {
  static propTypes = {
    clearDialogs: PropTypes.func.isRequired,
    className: PropTypes.string,
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
    registerKeypress('esc', this.unmountDialog)
  }

  componentWillUnmount () {
    deregisterKeypress('esc', this.unmountDialog)
  }

  componentDidCatch (error, info) {
    this.setState({
      error
    })
  }

  unmountDialog = () => {
    this.props.clearDialogs()
  }

  onClickShield = () => {
    if (!this.props.disableShieldExit) {
      this.unmountDialog()
    }
  }

  render () {
    let className = 'dialog-box'
    if (this.props.className !== undefined) {
      className += ` ${this.props.className}`
    }

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
              <button onClick={this.unmountDialog} title={t('btn.close', 'Close')}>
                {t('btn.close', 'Close')}
              </button>
            </p>
          </div>
        ) : (
          <div className={className}>
            <button
              className="close"
              onClick={this.unmountDialog}
              title={t('btn.close', 'Close')}
            >
              ×
            </button>
            {React.cloneElement(this.props.children, { closeDialog: this.props.clearDialogs })}
          </div>
        )}
      </div>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    clearDialogs: () => { dispatch(clearDialogs()) }
  }
}

export default connect(null, mapDispatchToProps)(Dialog)
