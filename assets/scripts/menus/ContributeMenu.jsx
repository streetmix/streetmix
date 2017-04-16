import React from 'react'
import Menu from './Menu'
import { trackEvent } from '../app/event_tracking'
// import { t } from '../app/locale'

export default class ContributeMenu extends React.PureComponent {
  onClickGitHub () {
    trackEvent('INTERACTION', '[Contribute menu] GitHub link clicked', null, null, false)
  }

  onClickDonate () {
    trackEvent('INTERACTION', '[Contribute menu] Donate link clicked', null, null, false)
  }

  onClickStickers () {
    trackEvent('INTERACTION', '[Contribute menu] Stickers link clicked', null, null, false)
  }

  render () {
    return (
      <Menu {...this.props}>
        <a href='https://github.com/streetmix/streetmix/' target='_blank' onClick={this.onClickGitHub}>
          <svg className='icon'>
            <use xlinkHref='#icon-github' />
          </svg>
          <span data-i18n='menu.contribute.opensource'>Contribute to open source</span>
        </a>
        <a href='https://opencollective.com/streetmix/' target='_blank' onClick={this.onClickDonate}>
          <span data-i18n='menu.contribute.donate'>Donate</span>
        </a>
        <a href='https://www.stickermule.com/user/1069909781/stickers' target='_blank' onClick={this.onClickStickers}>
          <span data-i18n='menu.contribute.stickers'>Buy a sticker sheet!</span>
        </a>
      </Menu>
    )
  }
}
