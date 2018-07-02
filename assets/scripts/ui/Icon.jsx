import React from 'react'
import PropTypes from 'prop-types'

export default class Icon extends React.Component {
  static propTypes = {
    icon: PropTypes.string.isRequired
  }

  render () {
    return (
      <svg className="icon">
        <use xlinkHref={`#icon-${this.props.icon}`} />
      </svg>
    )
  }
}
