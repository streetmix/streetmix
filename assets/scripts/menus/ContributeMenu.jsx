import React from 'react'
import { FormattedMessage } from 'react-intl'
import Menu from './Menu'
import { trackEvent } from '../app/event_tracking'

function handleClickDonate () {
  trackEvent(
    'INTERACTION',
    '[Contribute menu] Donate link clicked',
    null,
    null,
    false
  )
}

// function onClickStickers () {
//   trackEvent(
//     'INTERACTION',
//     '[Contribute menu] Stickers link clicked',
//     null,
//     null,
//     false
//   )
// }

function ContributeMenu (props) {
  return (
    <Menu {...props}>
      <a
        href="https://opencollective.com/streetmix/"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClickDonate}
      >
        <FormattedMessage id="menu.contribute.donate" defaultMessage="Donate" />
      </a>
      {/* Sticker link is broken */}
      {/* <a
        href="https://www.stickermule.com/user/1069909781/stickers"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClickStickers}
      >
        <FormattedMessage
          id="menu.contribute.stickers"
          defaultMessage="Buy a sticker sheet!"
        />
      </a> */}
    </Menu>
  )
}

export default ContributeMenu
