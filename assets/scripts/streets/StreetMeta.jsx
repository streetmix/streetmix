import React from 'react'
import StreetMetaWidth from './StreetMetaWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'
import './StreetMeta.scss'

const StreetMeta = (props) => (
  <div className="street-metadata">
    <StreetMetaWidth />
    <StreetMetaGeotag />
    <StreetMetaAuthor />
    <StreetMetaDate />
  </div>
)

export default StreetMeta
