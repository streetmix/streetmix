import React from 'react'

import { useSelector } from '../../store/hooks'
import StreetMetaWidth from './StreetMetaWidth'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'
import { StreetMetaAnalytics } from './StreetMetaAnalytics'
import './StreetMeta.css'

function StreetMeta(): React.ReactElement {
  const enableAnalytics = useSelector(
    (state) => state.flags.ANALYTICS?.value ?? false
  )

  return (
    <div className="street-meta">
      <StreetMetaWidth />
      {enableAnalytics && <StreetMetaAnalytics />}
      <StreetMetaGeotag />
      <StreetMetaAuthor />
      <StreetMetaDate />
    </div>
  )
}

export default StreetMeta
