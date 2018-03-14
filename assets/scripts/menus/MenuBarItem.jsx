import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'

export class MenuBarItem extends React.Component {
  static propTypes = {
    children: PropTypes.any,
    name: PropTypes.string,
    translation: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    handleClick: PropTypes.func,
    requireInternet: PropTypes.bool,
    noInternet: PropTypes.bool
  }

  static defaultProps = {
    requireInternet: false
  }

  render () {
    const { name, translation, label, requireInternet } = this.props

    if (requireInternet && this.props.noInternet) return null

    // Buttons have `disabled={false}` because Firefox
    // sometimes disables some buttons… unsure why
    return (
      <li>
        <button
          data-name={name}
          className="menu-attached"
          disabled={false}
          onClick={this.props.handleClick}
        >
          {this.props.children || <FormattedMessage id={translation} defaultMessage={label} />}
        </button>
      </li>
    )
  }
}

function mapStateToProps (state) {
  return {
    noInternet: state.system.noInternet
  }
}

export default connect(mapStateToProps)(MenuBarItem)
