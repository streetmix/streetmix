import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import Icon from '../ui/Icon'
import { trackEvent } from '../app/event_tracking'
import { showDialog } from '../store/actions/dialogs'

class ContactMenu extends React.PureComponent {
  static propTypes = {
    showMinecraftDialog: PropTypes.func
  }

  onClickGitHub () {
    trackEvent('INTERACTION', '[Contribute menu] GitHub link clicked', null, null, false)
  }

  render () {
    return (
      <Menu {...this.props}>
        <a href="https://discord.gg/NsKmV3S" target="_blank" rel="noopener noreferrer">
          <Icon icon="discord" />
          <FormattedMessage id="menu.contact.discord" defaultMessage="Join Discord chat" />
        </a>
        <a href="https://forums.streetmix.net/" target="_blank" rel="noopener noreferrer">
          <Icon icon="forums" />
          <FormattedMessage id="menu.contact.forums" defaultMessage="Discuss on the forums" />
        </a>
        <a href="https://github.com/streetmix/streetmix/" target="_blank" rel="noopener noreferrer">
          <Icon icon="github" />
          <FormattedMessage id="menu.contact.github" defaultMessage="View source code on GitHub" />
        </a>
        <a href="https://twitter.com/intent/tweet?text=@streetmix" target="_blank" rel="noopener noreferrer">
          <Icon icon="twitter" />
          <FormattedMessage id="menu.contact.twitter" defaultMessage="Send a tweet to @streetmix" />
        </a>
        <a href="#" onClick={this.props.showMinecraftDialog}>
          <FormattedMessage id="menu.contact.minecraft" defaultMessage="Play Minecraft with us!&lrm;" />
        </a>
      </Menu>
    )
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showMinecraftDialog: () => { dispatch(showDialog('MINECRAFT')) }
  }
}

export default connect(null, mapDispatchToProps)(ContactMenu)
