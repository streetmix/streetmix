import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

export class MenuBarItem extends React.PureComponent {
  static propTypes = {
    // Accepts children
    children: PropTypes.any,

    // Otherwise, uses a <FormattedMessage /> component to render menu label
    label: PropTypes.string,
    translation: PropTypes.string,

    // If provided, renders using anchor tags intead of buttons
    url: PropTypes.string,

    // Event handlers
    onClick: PropTypes.func,

    // Won't display if there's no internet detected
    requireInternet: PropTypes.bool,

    // Props from store
    dispatch: PropTypes.func,
    noInternet: PropTypes.bool
  }

  static defaultProps = {
    requireInternet: false,
    onClick: () => {},
    translation: '',
    label: ''
  }

  render () {
    const { translation, label, requireInternet, url, onClick, noInternet, dispatch, ...restProps } = this.props

    if (requireInternet && noInternet) return null

    const children = this.props.children ||
      <FormattedMessage id={translation} defaultMessage={label} />

    const SignInButton = (
      <button
        className="menu-sign-in"
        disabled={false}
        onClick={onClick}
        {...restProps}
      >
        {children}
      </button>
    )

    if (url) {
      return (
        <li>
          <a href={url} onClick={onClick} {...restProps}>
            {children}
          </a>
        </li>
      )
    } else {
      if (label === 'Sign in') {
        return SignInButton
      }
      // Buttons have `disabled={false}` because Firefox
      // sometimes disables some buttons… unsure why
      return (
        <li>
          <button
            className="menu-attached"
            disabled={false}
            onClick={onClick}
            {...restProps}
          >
            {children}
          </button>
        </li>
      )
    }
  }
}

function mapStateToProps (state) {
  return {
    noInternet: state.system.noInternet
  }
}

export default connect(mapStateToProps)(MenuBarItem)
