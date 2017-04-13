import React from 'react'
import Menu from './Menu'
// import { t } from '../app/locale'

export default class ContactMenu extends React.PureComponent {
  render () {
    return (
      <Menu {...this.props}>
        <a href='http://forums.streetmix.net/' target='_blank'>
          <svg className='icon'>
            <use xlinkHref='#icon-forums' />
          </svg>
          <span data-i18n='menu.contact.forums'>Discuss on the forums</span>
        </a>
        <a href='https://twitter.com/intent/tweet?text=@streetmix' target='_blank'>
          <svg className='icon'>
            <use xlinkHref='#icon-twitter' />
          </svg>
          <span data-i18n='menu.contact.twitter'>Send a tweet to @streetmix</span>
        </a>
        <a href='http://streetmix-slack.herokuapp.com/' target='_blank'>
          <svg className='icon'>
            <use xlinkHref='#icon-slack' />
          </svg>
          <span data-i18n='menu.contact.slack'>Join Slack chat</span>
        </a>
        <a href='http://blog.streetmix.net' target='_blank'>
          <span data-i18n='menu.contact.blog'>Visit Streetmix blog</span>
        </a>
      </Menu>
    )
  }
}
