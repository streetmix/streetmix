import React, { useEffect, useRef } from 'react'
import { FormattedMessage } from 'react-intl'
import Dialog from './Dialog'
import html from './Newsletter/mailchimp.html'
import './Newsletter/mailchimp.css'
import './NewsletterDialog.scss'

const NewsletterDialog = (props) => {
  // After mounting, attach "close dialog" functionality to Mailchimp's HTML.
  // This is a workaround because we are not rendering the HTML through React.
  const closeDialogFunc = useRef(() => {})
  const subscribeButton = useRef(null)
  useEffect(() => {
    let handler = closeDialogFunc.current
    subscribeButton.current = document.querySelector('#mc-embedded-subscribe')
    if (subscribeButton.current) {
      subscribeButton.current.addEventListener('click', handler)
    }
    return () => {
      if (subscribeButton.current) {
        subscribeButton.current.removeEventListener('click', handler)
      }
    }
  })

  return (
    <Dialog>
      {(closeDialog) => {
        // Store the closeDialog function to a reference for useEffect()
        closeDialogFunc.current = closeDialog

        return (
          <div className="newsletter-dialog">
            <header>
              <h1>
                <FormattedMessage id="dialogs.newsletter.heading" defaultMessage="Subscribe to our newsletter" />
              </h1>
            </header>
            <div className="dialog-content">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        )
      }}
    </Dialog>
  )
}

export default React.memo(NewsletterDialog)
