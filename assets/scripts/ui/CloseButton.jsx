import React from 'react'
import PropTypes from 'prop-types'
import { injectIntl, intlShape } from 'react-intl'

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
    const title = this.props.title || this.props.intl.formatMessage({
      id: 'btn.dismiss',
      defaultMessage: 'Dismiss'
    })

    return (
      <button
        className={this.props.className}
        onClick={this.props.onClick}
        title={title}
      >
        ×
      </button>
    )
  }
}

export default injectIntl(CloseButton)
