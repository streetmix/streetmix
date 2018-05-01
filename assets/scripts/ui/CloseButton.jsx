import React from 'react'
import PropTypes from 'prop-types'

export default class CloseButton extends React.Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    title: PropTypes.string,
    className: PropTypes.string
  }
  static defaultProps = {
    className: 'close',
    title: ''
  }
  render () {
    return (
      <button
        className={this.props.className}
        onClick={this.props.onClick}
        title={this.props.title}
      >
            ×
      </button>
    )
  }
}
