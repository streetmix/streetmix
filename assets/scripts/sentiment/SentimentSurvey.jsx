import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { FormattedMessage, useIntl } from 'react-intl'
import { useTransition, animated, config } from 'react-spring'
import CloseButton from '../ui/CloseButton'
import PaletteTooltips from '../palette/PaletteTooltips'
import './SentimentSurvey.scss'
import IMG_SENTIMENT_1 from '../../images/openmoji/color/1F620.svg'
import IMG_SENTIMENT_2 from '../../images/openmoji/color/1F641.svg'
import IMG_SENTIMENT_3 from '../../images/openmoji/color/1F610.svg'
import IMG_SENTIMENT_4 from '../../images/openmoji/color/1F60A.svg'
import IMG_SENTIMENT_5 from '../../images/openmoji/color/1F60D.svg'

SentimentSurvey.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func
}

function SentimentSurvey ({ visible = false, onClose = () => {} }) {
  const intl = useIntl()
  const [tooltip, setTooltip] = useState({
    label: null,
    visible: false,
    position: {}
  })

  const transitions = useTransition(visible, null, {
    from: { transform: 'translateY(200px)' },
    enter: { transform: 'translateY(0)' },
    leave: { transform: 'translateY(300px)' },
    config: config.wobbly
  })

  /**
   * Each segment in palette calls this function when the pointer hovers over it so we know
   * what to display in the tooltip
   *
   * @param {Object} event - event handler object
   * @param {string} label - text to display inside the tooltip
   */
  function handlePointerOver (event, label) {
    // x is the position right above the middle of the segment element to point at
    const rect = event.target.getBoundingClientRect()
    const x = rect.x + rect.width / 2

    setTooltip({
      label: label,
      visible: true,
      position: { x }
    })
  }

  /**
   * When the pointer leaves the segment area, hide tooltip.
   */
  function handlePointerOut (event) {
    setTooltip({
      ...tooltip,
      visible: false
    })
  }

  const classNames = ['sentiment-survey-container']
  if (visible === true) {
    classNames.push('sentiment-survey-visible')
  }

  /* eslint-disable react/jsx-indent */
  return (
    <div className={classNames.join(' ')}>
      <div className="sentiment-survey-background" />
      {transitions.map(
        ({ item, key, props }) =>
          item && (
            <animated.div
              className="sentiment-survey-dialog"
              key={key}
              style={props}
            >
              <CloseButton onClick={onClose} />
              <h2>
                <FormattedMessage
                  id="sentiment.prompt.joyful"
                  defaultMessage="How <em>joyful</em> is this street?"
                  values={{
                    em: (...chunks) => <em>{chunks}</em>
                  }}
                />
              </h2>
              <div className="sentiment-survey-buttons">
                <button
                  className="sentiment-1"
                  onPointerOver={(e) =>
                    handlePointerOver(
                      e,
                      intl.formatMessage({
                        id: 'sentiment.answer.rating-1',
                        defaultMessage: 'Absolutely not'
                      })
                    )}
                  onPointerOut={handlePointerOut}
                >
                  <img src={IMG_SENTIMENT_1} />
                </button>
                <button
                  className="sentiment-2"
                  onPointerOver={(e) =>
                    handlePointerOver(
                      e,
                      intl.formatMessage({
                        id: 'sentiment.answer.rating-2',
                        defaultMessage: 'Not very much'
                      })
                    )}
                  onPointerOut={handlePointerOut}
                >
                  <img src={IMG_SENTIMENT_2} />
                </button>
                <button
                  className="sentiment-3"
                  onPointerOver={(e) =>
                    handlePointerOver(
                      e,
                      intl.formatMessage({
                        id: 'sentiment.answer.rating-3',
                        defaultMessage: 'It’s so-so'
                      })
                    )}
                  onPointerOut={handlePointerOut}
                >
                  <img src={IMG_SENTIMENT_3} />
                </button>
                <button
                  className="sentiment-4"
                  onPointerOver={(e) =>
                    handlePointerOver(
                      e,
                      intl.formatMessage({
                        id: 'sentiment.answer.rating-4',
                        defaultMessage: 'A little bit'
                      })
                    )}
                  onPointerOut={handlePointerOut}
                >
                  <img src={IMG_SENTIMENT_4} />
                </button>
                <button
                  className="sentiment-5"
                  onPointerOver={(e) =>
                    handlePointerOver(
                      e,
                      intl.formatMessage({
                        id: 'sentiment.answer.rating-5',
                        defaultMessage: 'Quite a lot'
                      })
                    )}
                  onPointerOut={handlePointerOut}
                >
                  <img src={IMG_SENTIMENT_5} />
                </button>
              </div>
              <p>
                <FormattedMessage
                  id="sentiment.about-text"
                  defaultMessage="This survey helps Streetmix learn how people feel about streets."
                />
              </p>
            </animated.div>
          )
      )}
      <PaletteTooltips
        label={tooltip.label}
        visible={tooltip.visible}
        pointAt={tooltip.position}
      />
    </div>
  )
}

export default SentimentSurvey
