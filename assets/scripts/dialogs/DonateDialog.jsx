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
        <div className='donate-dialog-text'>
          <p className='donate-dialog-lede'>
            Streetmix is a community-supported project. We do not show ads or make money by abusing your privacy. Instead, we depend on your support to keep Streetmix up and running.
          </p>
          <p>
            Please consider supporting us with a one-time or recurring contribution through our partners at OpenCollective. Your donations will pay for the infrastructure to support other non-profits, advocacy groups, and students working to improve our streets, and additional revenue will be invested into further development, and new features. Through OpenCollective's platform, our expenses are completely transparent, so you can see how your contributions are used by the Streetmix team.
          </p>
        </div>
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
