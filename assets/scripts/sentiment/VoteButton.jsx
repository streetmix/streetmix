import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '../ui/Tooltip'

VoteButton.propTypes = {
  score: PropTypes.number,
  label: PropTypes.string,
  imgSrc: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  tooltipTarget: PropTypes.object
}

function VoteButton ({
  score,
  label,
  imgSrc,
  className,
  disabled = false,
  onClick,
  tooltipTarget
}) {
  function handleClick (event) {
    onClick(score, event)
  }

  const classNames = ['sentiment-button', className].join(' ')

  return (
    <Tooltip label={label} target={tooltipTarget}>
      <button
        className="sentiment-button-container"
        onClick={handleClick}
        disabled={disabled}
      >
        <div className={classNames}>
          <img src={imgSrc} draggable="false" alt={label} />
        </div>
      </button>
    </Tooltip>
  )
}

export default VoteButton
