import React from 'react'
import PropTypes from 'prop-types'
import { useIntl } from 'react-intl'
import { XIcon } from '@primer/octicons-react'
import './CloseButton.scss'

const CloseButton = React.forwardRef((props, ref) => {
  const { title, className = 'close', onClick = () => {}, ...restProps } = props
  const defaultTitle = useIntl().formatMessage({
    id: 'btn.dismiss',
    defaultMessage: 'Dismiss'
  })

  return (
    <button
      ref={ref}
      className={className}
      onClick={onClick}
      title={title || defaultTitle}
      {...restProps}
    >
      <XIcon size={16} />
    </button>
  )
})

CloseButton.displayName = 'CloseButton'
CloseButton.propTypes = {
  onClick: PropTypes.func,
  title: PropTypes.string,
  className: PropTypes.string
}

export default CloseButton
