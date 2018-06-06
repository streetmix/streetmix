import React from 'react'
import StreetMetaWidth from './StreetMetaWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'

export default class StreetMeta extends React.Component {
  render () {
    return (
      <div className="street-metadata">
        <StreetMetaWidth />
        <StreetMetaGeotag />
        <StreetMetaAuthor />
        <StreetMetaDate />
      </div>
    )
  }
}
