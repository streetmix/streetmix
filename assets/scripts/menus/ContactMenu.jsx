import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import Icon from '../ui/Icon'
import { trackEvent } from '../app/event_tracking'

export default class ContactMenu extends React.PureComponent {
  onClickGitHub () {
    trackEvent('INTERACTION', '[Contribute menu] GitHub link clicked', null, null, false)
  }

  render () {
    return (
      <Menu {...this.props}>
        <a href="http://forums.streetmix.net/" target="_blank">
          <Icon icon="forums" />
          <FormattedMessage id="menu.contact.forums" defaultMessage="Discuss on the forums" />
        </a>
        <a href="https://twitter.com/intent/tweet?text=@streetmix" target="_blank" rel="noopener noreferrer">
          <Icon icon="twitter" />
          <FormattedMessage id="menu.contact.twitter" defaultMessage="Send a tweet to @streetmix" />
        </a>
        <a href="http://streetmix-slack.herokuapp.com/" target="_blank" rel="noopener noreferrer">
          <Icon icon="slack" />
          <FormattedMessage id="menu.contact.slack" defaultMessage="Join Slack chat" />
        </a>
        <a href="https://medium.com/streetmixology" target="_blank" rel="noopener noreferrer">
          <FormattedMessage id="menu.contact.blog" defaultMessage="Visit Streetmix blog" />
        </a>
        <a href="https://github.com/streetmix/streetmix/" target="_blank" rel="noopener noreferrer" onClick={this.onClickGitHub}>
          <Icon icon="github" />
          <FormattedMessage id="menu.contribute.opensource" defaultMessage="Contribute to open source" />
        </a>
      </Menu>
    )
  }
}
