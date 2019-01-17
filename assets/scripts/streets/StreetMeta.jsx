import React, { Component } from 'react'
import PropTypes from 'prop-types'
import StreetMetaWidth from './StreetMetaWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'
import './StreetMeta.scss'

export default class StreetMeta extends Component {
  static propTypes = {
    invertUITextColor: PropTypes.bool
  }

  static defaultProps = {
    invertUITextColor: false
  }

  render () {
    const classNames = ['street-metadata']

    if (this.props.invertUITextColor) {
      classNames.push('street-metadata-invert-color')
    }

    return (
      <div className={classNames.join(' ')}>
        <StreetMetaWidth />
        <StreetMetaGeotag />
        <StreetMetaAuthor />
        <StreetMetaDate />
      </div>
    )
  }
}
