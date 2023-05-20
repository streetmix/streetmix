import React from 'react'
import PropTypes from 'prop-types'
import './LoadingSpinner.scss'

const SPINNER_SIZES = {
  NORMAL: 'normal',
  SMALL: 'small'
}

/**
 * The <LoadingSpinner /> is an element that only displays a visual spinner.
 * It is up to the parent element or component to handle placement
 * and accessibility. The spinner does not come with a text label. If
 * you need a text label, the parent component should provide one.
 *
 * The `size` prop allows you to create a smaller spinner ideal for inline
 * UI situations, but the size can also be overriden via CSS (see stylesheet).
 */
function LoadingSpinner ({ size }) {
  const classNames = ['loading-spinner']

  if (size === SPINNER_SIZES.SMALL) {
    classNames.push('loading-spinner-small')
  }

  return <div className={classNames.join(' ')} />
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(Object.values(SPINNER_SIZES))
}

export default LoadingSpinner
