import { useSelector } from '../../store/hooks.js'
import StreetMetaWidth from './StreetMetaWidth.js'
import StreetMetaAuthor from './StreetMetaAuthor.js'
import StreetMetaDate from './StreetMetaDate.js'
import StreetMetaGeotag from './StreetMetaGeotag.js'
import { StreetMetaAnalytics } from './StreetMetaAnalytics.js'
import './StreetMeta.css'

export function StreetMeta() {
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
