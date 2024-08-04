import React, { memo } from 'react'
import { useIntl } from 'react-intl'

import Icon from './Icon'
import './CloseButton.scss'

interface CloseButtonProps {
  title?: string
  className?: string
  onClick: (event: React.MouseEvent) => void
}

function CloseButton ({
  title,
  className = 'close',
  onClick,
  ...restProps
}: CloseButtonProps): React.ReactElement {
  const defaultTitle = useIntl().formatMessage({
    id: 'btn.dismiss',
    defaultMessage: 'Dismiss'
  })

  return (
    <button
      className={className}
      onClick={onClick}
      title={title ?? defaultTitle}
      {...restProps}
    >
      <Icon name="close" />
    </button>
  )
}

export default memo(CloseButton)
