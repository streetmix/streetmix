import React from 'react'
import Menu from './Menu'
// import { t } from '../app/locale'

export default class ContributeMenu extends React.PureComponent {
  render () {
    return (
      <Menu {...this.props}>
        <a href='https://github.com/streetmix/streetmix/' target='_blank'>
          <svg className='icon'>
            <use xlinkHref='#icon-github' />
          </svg>
          <span data-i18n='menu.contribute.opensource'>Contribute to open source</span>
        </a>
        <a href='https://opencollective.com/streetmix/' target='_blank'>
          <span data-i18n='menu.contribute.donate'>Donate</span>
        </a>
        <a href='https://www.stickermule.com/user/1069909781/stickers' target='_blank'>
          <span data-i18n='menu.contribute.stickers'>Buy a sticker sheet!</span>
        </a>
      </Menu>
    )
  }
}
