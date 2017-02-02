/**
 * Donate (dialog box)
 *
 * Handles the "Donate" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */
import React from 'react'
import Dialog from './Dialog'
import { trackEvent } from '../app/event_tracking'

export default class DonateDialog extends React.Component {
  componentDidMount () {
    trackEvent('Interaction', 'Display donate dialog box', null, null, false)
  }

  render () {
    return (
      <Dialog className='about-dialog' disableShieldExit>
        <h1>Thank you for using Streetmix.</h1>
        <div className='about-dialog-left'>
          <div className='about-dialog-description'>
            Streetmix is a community-supported project and it needs your support
            to keep the lights on.
          </div>
        </div>
        <div className='about-dialog-right'>
          <p>
            You can make a donation through OpenCollective here. Donations
            are totally transparent so you can see how your contributions are
            being used to work on Streetmix.
          </p>
        </div>
      </Dialog>
    )
  }
}
