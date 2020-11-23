import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { XIcon } from '@primer/octicons-react'
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
      <XIcon size={16} />
    </button>
  )
}

export default React.memo(CloseButton)
