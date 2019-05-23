import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl, intlShape } from 'react-intl'
import { ICON_TIMES } from '../ui/icons'
import './CloseButton.scss'

const CloseButton = (props) => {
  const { title, className, onClick, intl, ...restProps } = props
  const displayTitle = title || intl.formatMessage({
    id: 'btn.dismiss',
    defaultMessage: 'Dismiss'
  })

  return (
    <button
      className={className}
      onClick={onClick}
      title={displayTitle}
      {...restProps}
    >
      <FontAwesomeIcon icon={ICON_TIMES} />
    </button>
  )
}

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  intl: intlShape.isRequired
}

CloseButton.defaultProps = {
  className: 'close'
}

export default React.memo(injectIntl(CloseButton))
