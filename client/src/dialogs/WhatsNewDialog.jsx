import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FormattedMessage } from 'react-intl'
// Importing 'property-information' is a workaround for Parcel + React-Markdown bug
// https://github.com/parcel-bundler/parcel/discussions/9113
import 'property-information'
import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'
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
      setContent(response.data)
      setSubmitState('OK')
    } catch (error) {
      // The error handling here handles both server errors (e.g. 404, 500, etc)
      // as well as client side errors (e.g. user is offline). Both situations
      // will display the same generic error for now.
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
                defaultMessage="This information is provided in English only.&lrm;"
              />
            </div>
          )}
          <div className="dialog-content dialog-content-bleed" dir="ltr">
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
                  urlTransform={(url) => {
                    return url.replace('/img/', '/images/')
                  }}
                  rehypePlugins={[
                    [
                      rehypeExternalLinks,
                      { rel: 'noopener noreferrer', target: '_blank' }
                    ]
                  ]}
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
