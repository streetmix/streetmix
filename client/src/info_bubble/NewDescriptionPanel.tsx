import React from 'react'
import { IntlProvider, FormattedMessage } from 'react-intl'
import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { setSkybox } from '~/src/store/slices/street'
import { hideDescription } from '~/src/store/slices/infoBubble'
import { formatMessage } from '~/src/locales/locale'
import FloatingPanel from '~/src/ui/FloatingPanel'
import './NewDescriptionPanel.css'

function DescriptionPanel (): React.ReactElement | null {
  const show = useSelector((state) => state.infoBubble.descriptionVisible)
  const description = useSelector((state) => state.infoBubble.descriptionData)
  const offline = useSelector((state) => state.system.offline)
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  function handleClose (): void {
    dispatch(hideDescription())
  }

  function handleSelect (id: string): void {
    dispatch(setSkybox(id))
  }

  if (description === null) return null

  // If the description content doesn't exist or hasn't been translated, bail.
  const content = formatMessage(
    `descriptions.${description.key}.content`,
    undefined,
    {
      ns: 'segment-info'
    }
  )

  const caption = formatMessage(
    `descriptions.${description.key}.imageCaption`,
    undefined,
    { ns: 'segment-info' }
  )

  const allowedElements = [
    'p',
    'em',
    'strong',
    'ol',
    'ul',
    'li',
    'blockquote',
    'h1'
  ]
  if (!offline) {
    allowedElements.push('a')
  }

  return (
    <FloatingPanel
      icon="sun"
      title={
        <FormattedMessage
          id="tools.skybox.heading"
          defaultMessage="Environment"
        />
      }
      show={show}
      className="description-panel"
      handleClose={handleClose}
    >
      <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
        <div className="description">
          <div className="description-content">
            {description.image && (
              <img
                src={`/images/info-bubble-examples/${description.image}`}
                alt={caption ?? ''}
              />
            )}
            <div className="description-text">
              <ReactMarkdown
                allowedElements={allowedElements}
                unwrapDisallowed
                rehypePlugins={[
                  [
                    rehypeExternalLinks,
                    { rel: 'noopener noreferrer', target: '_blank' }
                  ]
                ]}
              >
                {content}
              </ReactMarkdown>
              {caption && (
                <footer>
                  <FormattedMessage
                    id="segments.description.photo-credit"
                    defaultMessage="Photo:"
                  />
                  &nbsp;
                  {caption}
                </footer>
              )}
            </div>
          </div>
        </div>
      </IntlProvider>
    </FloatingPanel>
  )
}

export default DescriptionPanel
