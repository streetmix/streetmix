import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import StreetMetaWidthContainer from './StreetMetaWidthContainer'
import StreetMetaAuthor from './StreetMetaAuthor'
import StreetMetaDate from './StreetMetaDate'
import StreetMetaGeotag from './StreetMetaGeotag'
import StreetMetaAnalytics from './StreetMetaAnalytics'
import './StreetMeta.scss'

const StreetMeta = (props) => (
  <div className="street-metadata">
    <StreetMetaWidthContainer />
    {props.enableAnalytics && <StreetMetaAnalytics />}
    <StreetMetaGeotag />
    <StreetMetaAuthor />
    <StreetMetaDate />
  </div>
)

function mapStateToProps (state) {
  return {
    enableAnalytics: state.flags.ANALYTICS.value
  }
}

StreetMeta.propTypes = {
  enableAnalytics: PropTypes.bool
}

export default connect(mapStateToProps)(StreetMeta)
