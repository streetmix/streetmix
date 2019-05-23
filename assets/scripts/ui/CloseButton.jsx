import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { injectIntl, intlShape } from 'react-intl'
import { ICON_TIMES } from '../ui/icons'
import './CloseButton.scss'

class CloseButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    className: PropTypes.string,
    intl: intlShape.isRequired
  }

  static defaultProps = {
    className: 'close'
  }

  render () {
    const { title, className, onClick, intl, ...restProps } = this.props
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
}

export default injectIntl(CloseButton)
