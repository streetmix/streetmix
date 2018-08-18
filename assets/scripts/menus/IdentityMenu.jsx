import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import { showGallery } from '../gallery/view'
import { onSignOutClick } from '../users/authentication'

class IdentityMenu extends React.PureComponent {
  static propTypes = {
    userId: PropTypes.string,
    noInternet: PropTypes.bool
  }

  onClickMyStreets = (event) => {
    event.preventDefault()

    if (this.props.userId) {
      showGallery(this.props.userId, false)
    } else {
      showGallery(null, false, true)
    }
  }

  render () {
    return (
      <Menu {...this.props}>
        <ul className="menu-item-group">
          {!this.props.noInternet &&
            <li className="menu-item" onClick={this.onClickMyStreets}>
              <FormattedMessage id="menu.item.my-streets" defaultMessage="My streets" />
            </li>
          }
        </ul>
        <ul className="menu-item-group">
          <li className="menu-item" onClick={onSignOutClick}>
            <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
          </li>
        </ul>
      </Menu>
    )
  }
}

function mapStateToProps (state) {
  return {
    userId: state.user.signInData && state.user.signInData.userId,
    noInternet: state.system.noInternet
  }
}

export default connect(mapStateToProps)(IdentityMenu)
