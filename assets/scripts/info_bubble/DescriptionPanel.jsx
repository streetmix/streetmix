import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage } from 'react-intl'
import ReactMarkdown from 'react-markdown'
import Transition from 'react-transition-group/Transition'
import Triangle from './Triangle'
import { getStreetSectionTop } from '../app/window_resize'
import './DescriptionPanel.scss'

const TRANSITION_DURATION = 250
const DEFAULT_STYLE = {
  opacity: 0,
  transformOrigin: '50% 0',
  transform: 'rotateX(20deg) translateY(100px)',
  transition: `opacity ${TRANSITION_DURATION}ms, transform ${TRANSITION_DURATION}ms`
}
const TRANSITION_STYLES = {
  entering: {
    opacity: 1,
    transform: 'none'
  },
  entered: {
    opacity: 1,
    transform: 'none'
  }
}

DescriptionPanel.propTypes = {
  visible: PropTypes.bool,
  image: PropTypes.string,
  content: PropTypes.string,
  caption: PropTypes.string,
  onClickHide: PropTypes.func,
  bubbleY: PropTypes.number,
  noInternet: PropTypes.bool
}

function DescriptionPanel ({
  visible = false,
  image,
  content,
  caption,
  onClickHide = () => {},
  bubbleY,
  noInternet = false
}) {
  const [highlightTriangle, setHighlightTriangle] = useState(false)

  function unhighlightTriangleDelayed () {
    window.setTimeout(() => {
      setHighlightTriangle(false)
    }, 200)
  }

  function handleToggleHighlightTriangle () {
    setHighlightTriangle(!highlightTriangle)
  }

  function handleClickHide (event) {
    onClickHide()
    unhighlightTriangleDelayed()
  }

  // TODO document magic numbers
  const height = getStreetSectionTop() + 300 - bubbleY + 'px'

  return (
    <Transition in={visible} timeout={TRANSITION_DURATION}>
      {(state) => (
        <div
          className="description-canvas"
          style={{
            ...DEFAULT_STYLE,
            ...TRANSITION_STYLES[state],
            height
          }}
        >
          <div className="description">
            <div className="description-content">
              {image && (
                <img
                  src={`/images/info-bubble-examples/${image}`}
                  alt={caption || ''}
                />
              )}
              <div className="description-text">
                <ReactMarkdown
                  source={content}
                  allowedTypes={[
                    'root',
                    'text',
                    'paragraph',
                    'emphasis',
                    'strong',
                    'list',
                    'listItem',
                    'blockquote',
                    'heading',
                    !noInternet && 'link'
                  ]}
                  unwrapDisallowed={true}
                  linkTarget="_blank"
                />
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
          <div
            className="description-close"
            onClick={handleClickHide}
            onMouseOver={handleToggleHighlightTriangle}
            onMouseOut={handleToggleHighlightTriangle}
          >
            <FormattedMessage id="btn.close" defaultMessage="Close" />
          </div>
          <Triangle highlight={highlightTriangle} />
        </div>
      )}
    </Transition>
  )
}

export default DescriptionPanel
