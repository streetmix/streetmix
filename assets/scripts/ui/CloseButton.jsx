import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_TIMES } from '../ui/icons'
import './CloseButton.scss'

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
}

function CloseButton (props) {
  const { title, className = 'close', onClick, ...restProps } = props
  const defaultTitle = useIntl().formatMessage({
    id: 'btn.dismiss',
    defaultMessage: 'Dismiss'
  })

  return (
    <button
      className={className}
      onClick={onClick}
      title={title || defaultTitle}
      {...restProps}
    >
      <FontAwesomeIcon icon={ICON_TIMES} />
    </button>
  )
}

export default React.memo(CloseButton)
