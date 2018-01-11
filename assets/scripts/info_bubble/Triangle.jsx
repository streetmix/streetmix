import React from 'react'
import PropTypes from 'prop-types'

export default class Triangle extends React.Component {
  static propTypes = {
    highlight: PropTypes.bool.isRequired
  }

  static defaultProps = {
    highlight: false
  }

  render () {
    // Triangle is highlighted when description button is hovered
    let triangleClassNames = ['info-bubble-triangle']
    if (this.props.highlight === true) {
      triangleClassNames.push('info-bubble-triangle-highlight')
    }

    return (
      <div className={triangleClassNames.join(' ')} />
    )
  }
}
