import React from 'react'
import PropTypes from 'prop-types'
import Tooltip from '../ui/Tooltip'

VoteButton.propTypes = {
  score: PropTypes.number,
  label: PropTypes.string,
  imgSrc: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  tooltipTarget: PropTypes.object
}

function VoteButton ({
  score,
  label,
  imgSrc,
  className,
  onClick,
  tooltipTarget
}) {
  function handleClick (event) {
    onClick(score, event)
  }

  const classNames = ['sentiment-button', className].join(' ')

  return (
    <Tooltip label={label} target={tooltipTarget}>
      <button onClick={handleClick}>
        <div className={classNames}>
          <img src={imgSrc} />
        </div>
      </button>
    </Tooltip>
  )
}

export default VoteButton
