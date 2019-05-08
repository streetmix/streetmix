import React from 'react'
import StreetMetaWidthContainer from './StreetMetaWidthContainer'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'
import './StreetMeta.scss'

const StreetMeta = (props) => (
  <div className="street-metadata">
    <StreetMetaWidthContainer />
    <StreetMetaGeotag />
    <StreetMetaAuthor />
    <StreetMetaDate />
  </div>
)

export default StreetMeta
