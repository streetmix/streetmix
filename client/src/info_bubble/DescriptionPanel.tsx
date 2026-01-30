import { IntlProvider, FormattedMessage } from 'react-intl'
import ReactMarkdown from 'react-markdown'
import rehypeExternalLinks from 'rehype-external-links'

import { useSelector, useDispatch } from '~/src/store/hooks.js'
import { hideDescription } from '~/src/store/slices/infoBubble.js'
import { formatMessage } from '~/src/locales/locale.js'
import { FloatingPanel } from '~/src/ui/FloatingPanel.js'
import './DescriptionPanel.css'

export function DescriptionPanel() {
  const show = useSelector((state) => state.infoBubble.descriptionVisible)
  const description = useSelector((state) => state.infoBubble.descriptionData)
  const offline = useSelector((state) => state.system.offline)
  const locale = useSelector((state) => state.locale)
  const dispatch = useDispatch()

  function handleClose(): void {
    dispatch(hideDescription())
  }

  if (description === null) return null

  // If the description content doesn't exist or hasn't been translated, bail.
  const content = formatMessage(
    `descriptions.${description.key}.content`,
    undefined,
    {
      ns: 'segment-info',
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
    'h1',
  ]
  if (!offline) {
    allowedElements.push('a')
  }

  return (
    <FloatingPanel
      icon="book"
      title={
        <FormattedMessage
          id="segments.learn-more"
          defaultMessage="Learn more"
        />
      }
      show={show}
      className="description-panel"
      handleClose={handleClose}
      position={{ x: 100, y: 100 }}
    >
      <IntlProvider locale={locale.locale} messages={locale.segmentInfo}>
        <div className="description-content">
          {description.image && (
            <img
              src={`/images/descriptions/${description.image}`}
              alt={caption ?? ''}
              draggable={false}
            />
          )}
          <div className="description-text">
            <ReactMarkdown
              allowedElements={allowedElements}
              unwrapDisallowed
              rehypePlugins={[
                [
                  rehypeExternalLinks,
                  { rel: 'noopener noreferrer', target: '_blank' },
                ],
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
      </IntlProvider>
    </FloatingPanel>
  )
}
