import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'

export default class ContactMenu extends React.PureComponent {
  render () {
    return (
      <Menu {...this.props}>
        <a href="http://forums.streetmix.net/" target="_blank">
          <svg className="icon">
            <use xlinkHref="#icon-forums" />
          </svg>
          <FormattedMessage id="menu.contact.forums" defaultMessage="Discuss on the forums" />
        </a>
        <a href="https://twitter.com/intent/tweet?text=@streetmix" target="_blank" rel="noopener noreferrer">
          <svg className="icon">
            <use xlinkHref="#icon-twitter" />
          </svg>
          <FormattedMessage id="menu.contact.twitter" defaultMessage="Send a tweet to @streetmix" />
        </a>
        <a href="http://streetmix-slack.herokuapp.com/" target="_blank" rel="noopener noreferrer">
          <svg className="icon">
            <use xlinkHref="#icon-slack" />
          </svg>
          <FormattedMessage id="menu.contact.slack" defaultMessage="Join Slack chat" />
        </a>
        <a href="http://blog.streetmix.net" target="_blank">
          <FormattedMessage id="menu.contact.blog" defaultMessage="Visit Streetmix blog" />
        </a>
      </Menu>
    )
  }
}
