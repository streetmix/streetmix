import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import { showGallery } from '../gallery/view'
import { onSignOutClick } from '../users/authentication'
import './IdentityMenu.scss'

export class IdentityMenu extends React.PureComponent {
  static propTypes = {
    userId: PropTypes.string,
    noInternet: PropTypes.bool
  }

  onClickMyStreets = (event) => {
    event.preventDefault()

    showGallery(this.props.userId)
  }

  render () {
    const { userId } = this.props
    const myStreetsLink = userId ? `/${userId}` : ''

    return (
      <Menu {...this.props} className="identity-menu">
        {!this.props.noInternet &&
          <a href={myStreetsLink} onClick={this.onClickMyStreets}>
            <FormattedMessage id="menu.item.my-streets" defaultMessage="My streets" />
          </a>
        }
        <a className="menu-item" onClick={onSignOutClick}>
          <FormattedMessage id="menu.item.sign-out" defaultMessage="Sign out" />
        </a>
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
