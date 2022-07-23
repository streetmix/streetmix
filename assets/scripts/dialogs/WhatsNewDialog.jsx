import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import ReactMarkdown from 'react-markdown'
import LoadingSpinner from '../ui/LoadingSpinner'
import { getChangelog } from '../util/api'
import Dialog from './Dialog'
import './WhatsNewDialog.scss'

const WhatsNewDialog = () => {
  const locale = useSelector((state) => state.locale.locale)
  const [state, setSubmitState] = useState('LOADING')
  const [content, setContent] = useState(null)
  const [scrollShade, setScrollShade] = useState(false)

  useEffect(() => {
    getContent()
  }, [])

  const onScroll = (event) => {
    if (event.target.scrollTop > 30) {
      setScrollShade(true)
    } else {
      setScrollShade(false)
    }
  }

  async function getContent () {
    try {
      const response = await getChangelog()

      if (response.status === 200) {
        setContent(response.data)
        setSubmitState('OK')
      } else {
        // Errors are generic for now.
        setSubmitState('ERROR')
      }
    } catch (err) {
      // The error handling in the try block handles failures on the remote
      // server (e.g. 404, 500, etc). The error handling in the catch block
      // handles failures if the fetch fails on the client side (e.g. user is
      // offline). Both situations will display the same generic error for now.
      setSubmitState('ERROR')
    }
  }

  return (
    <Dialog>
      {(closeDialog) => (
        <div className="whats-new-dialog">
          <header>
            <h1>
              <FormattedMessage
                id="dialogs.whatsnew.heading"
                defaultMessage="What’s new in Streetmix?&lrm;"
              />
            </h1>
          </header>
          {locale.startsWith('en') === false && (
            <div className="whats-new-language-banner">
              <FormattedMessage
                id="dialogs.whatsnew.english-only"
                defaultMessage="This information is provided in English only."
              />
            </div>
          )}
          <div className="dialog-content dialog-content-bleed">
            <div className="whats-new-content" onScroll={onScroll}>
              {state === 'OK' && (
                <ReactMarkdown
                  allowedElements={[
                    'p',
                    'em',
                    'strong',
                    'ol',
                    'ul',
                    'li',
                    'blockquote',
                    'h1',
                    'h2',
                    'h3',
                    'a',
                    'img'
                  ]}
                  unwrapDisallowed={true}
                  linkTarget="_blank"
                  transformImageUri={(src) => {
                    return src.replace('/img/', '/images/')
                  }}
                >
                  {content}
                </ReactMarkdown>
              )}
              {state === 'LOADING' && (
                <div className="whats-new-loading">
                  <LoadingSpinner />
                </div>
              )}
              {state === 'ERROR' && (
                <p>
                  <FormattedMessage
                    id="generic-error-description"
                    defaultMessage="We’re sorry – something went wrong."
                  />
                </p>
              )}
            </div>
            <div
              className={`whats-new-scroll-shade${
                scrollShade ? ' visible' : ''
              }`}
            />
          </div>
          <button className="dialog-primary-action" onClick={closeDialog}>
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </button>
        </div>
      )}
    </Dialog>
  )
}

export default WhatsNewDialog
