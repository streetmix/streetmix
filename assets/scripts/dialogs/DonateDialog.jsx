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
      <Dialog className='donate-dialog' disableShieldExit>
        <h1>Thank you for using Streetmix.</h1>
        <p className='donate-dialog-lede'>
          We are a community-supported project. With your support, you’ll help
          us cover all the expenses Streetmix needs to keep going!
        </p>
        <p>
          You can make a donation through OpenCollective here. Donations
          are totally transparent so you can see how your contributions are
          being used to work on Streetmix.
        </p>
        <p>
          <a
            className='button-like donate-dialog-button'
            href='https://opencollective.com/streetmix'
            target='_blank'
          >
            Donate to Streetmix
          </a>
        </p>
        <p>
          <a href='#' onClick={this.close}>No thanks</a>
        </p>
      </Dialog>
    )
  }
}
