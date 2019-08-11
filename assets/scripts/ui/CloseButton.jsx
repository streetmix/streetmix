import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useIntl } from 'react-intl'
import { ICON_TIMES } from '../ui/icons'
import './CloseButton.scss'

const CloseButton = (props) => {
  const { title, className, onClick, ...restProps } = props
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

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  className: PropTypes.string
}

CloseButton.defaultProps = {
  className: 'close'
}

export default React.memo(CloseButton)
