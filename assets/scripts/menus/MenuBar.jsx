import React from 'react'
import EnvironmentBadge from './EnvironmentBadge'

import { debug } from '../preinit/debug_settings'

export default class MenuBar extends React.Component {
  render () {
    return (
      <nav id='#top-menu-bar' className='menu-bar'>
        <ul className='menu-bar-left'>
          <li className='menu-bar-title'>
            <div className='streetmix-logo' />
            <h1>Streetmix</h1>
          </li>
          <li id='help-menu-item'>
            <button id='help-menu-button' data-i18n='menu.item.help' className='menu-attached'>
              Help
            </button>
          </li>
          <li id='feedback-menu-item'>
            <button id='feedback-menu-button' data-i18n='menu.item.contact' className='menu-attached'>
              Contact
            </button>
          </li>
        </ul>
        <ul className='menu-bar-right'>
          <li id='identity-menu-item'>
            <button id='identity-menu-button' className='menu-attached' />
          </li>
          <li id='sign-in-menu-item'>
            <span id='sign-in-link' />
          </li>
          <li>
            <a target='_blank' href='/new' data-i18n='menu.item.new-street'>New street</a>
          </li>
          <li id='gallery-link'>
            <a href='' data-i18n='menu.item.my-streets'>My streets</a>
          </li>
          {
            (() => {
              if (debug.experimental) {
                return (
                  <li id='settings-menu-item'>
                    <button id='settings-menu-button' data-i18n='menu.item.settings' className='menu-attached'>
                      Settings
                    </button>
                  </li>
                )
              }
            })()
          }
          <li id='share-menu-item'>
            <button id='share-menu-button' data-i18n='menu.item.share' className='menu-attached'>
              Share
            </button>
          </li>
        </ul>
        <EnvironmentBadge />
      </nav>
    )
  }
}
