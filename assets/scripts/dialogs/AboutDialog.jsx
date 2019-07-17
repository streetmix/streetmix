/**
 * About Streetmix (dialog box)
 *
 * Renders the "About" dialog box.
 *
 */
import React, { useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import Credits from './About/Credits.jsx' // Without extension, test will erroneously import .json instead
import { trackEvent } from '../app/event_tracking'
import './AboutDialog.scss'

function AboutDialog (props) {
  useEffect(() => {
    trackEvent('Interaction', 'Open about dialog box', null, null, false)
  }, [])

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="about-dialog">
          <header>
            <div className="streetmix-logo" />
            <h1>
              <FormattedMessage id="dialogs.about.heading" defaultMessage="About Streetmix." />
            </h1>
          </header>
          <div className="dialog-content">
            <div className="about-dialog-content">
              <div className="about-dialog-left">
                <p>
                  <FormattedMessage id="dialogs.about.description" defaultMessage="Design, remix, and share your street. Add bike paths, widen sidewalks or traffic lanes, learn how all of this can impact your community." />
                </p>
                <p>
                  <FormattedMessage id="dialogs.about.sponsored-by" defaultMessage="Streetmix is generously sponsored by:" />
                </p>
                <ul className="about-dialog-sponsors">
                  <li>
                    <a href="https://numo.global/" target="_blank" rel="noopener noreferrer">
                      <img src="/images/sponsors/numo.svg" alt="New Urban Mobility Alliance" />
                    </a>
                  </li>
                  <li>
                    <a href="https://codeforamerica.org/" target="_blank" rel="noopener noreferrer">
                      <img src="/images/sponsors/codeforamerica.png" alt="Code for America" />
                    </a>
                  </li>
                  <li>
                    <a href="https://www.mozilla.org/en-US/moss/" target="_blank" rel="noopener noreferrer">
                      <img src="/images/sponsors/mozilla.svg" alt="Mozilla Open Source Support" />
                    </a>
                  </li>
                </ul>
                <p>
                  <a href="https://opencollective.com/streetmix/" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="dialogs.about.donate-link" defaultMessage="Support us financially" />
                  </a>
                  <br />
                  <a href="https://github.com/streetmix/streetmix/" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="dialogs.about.open-source-link" defaultMessage="We’re open source!&lrm;" />
                  </a>
                  <br />
                  <a href="https://medium.com/streetmixology" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="menu.contact.blog" defaultMessage="Visit Streetmix blog" />
                  </a>
                  <br />
                  <a href="https://streetmix.readthedocs.io/en/latest/guidebook/" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="dialogs.about.guidebook-link" defaultMessage="Guidebook" />
                  </a>
                </p>
                <p>
                  <a href="https://streetmix.net/terms-of-service/" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="dialogs.about.tos-link" defaultMessage="Terms of service" />
                  </a>
                  <br />
                  <a href="https://streetmix.net/privacy-policy/" target="_blank" rel="noopener noreferrer">
                    <FormattedMessage id="dialogs.about.privacy-link" defaultMessage="Privacy policy" />
                  </a>
                </p>
              </div>
              <div className="about-dialog-right">
                <Credits />
              </div>
            </div>
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default React.memo(AboutDialog)
