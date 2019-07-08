import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import SegmentForPalette from '../../segments/SegmentForPalette'
import { FormatNumber } from '../../util/formatting'
import Icon from '../../ui/Icon'

const generateClass = (value) => {
  if (value > 12000) {
    return 'positive'
  }

  if (value > 5000) {
    return 'warning'
  }

  return 'critical'
}

const PeopleGraph = ({ amount }) => {
  const peeps = [...Array(Math.floor(amount / 1000))]
  return (
    <span>
      {peeps.map(() => { return (<Icon icon="person" />) })}
    </span>
  )
}

PeopleGraph.propTypes = { amount: PropTypes.number.isRequired }

const SegmentAnalytics = ({ label, capacity, segment, locale }) => {
  const [expanded, setCollapsed] = useState(true)
  const { average, potential } = capacity
  const expandedEl = (
    <React.Fragment>
      <div>
        {label}
      </div>
      <SegmentForPalette
        onClick={() => setCollapsed(false)}
        key={segment.id}
        type={segment.type}
        variantString={segment.variantString}
      />
      <div className="table-container">
        <table>
          <thead>
            <td>Average</td>
            <td>Potential</td>
          </thead>
          <tr>
            <td className={generateClass(average)}>{FormatNumber(locale, average)}</td>
            <td className={generateClass(potential)}>{FormatNumber(locale, potential)}</td>
          </tr>
        </table>
        <div className="people-section">
          <PeopleGraph amount={average} />
          <PeopleGraph amount={potential - average} color={'#ccc'} />
        </div>
      </div>
    </React.Fragment>
  )

  return (
    <div className="segment-analytics">
      {expanded ? expandedEl : (<span>'not expanded'</span>)}
      {expanded ? (
        <a onClick={() => setCollapsed(false)}> read more</a>
      ) : (
        <a onClick={() => setCollapsed(true)}> read less</a>
      )}
    </div>
  )
}

SegmentAnalytics.propTypes = {
  locale: PropTypes.string,
  label: PropTypes.string.isRequired,
  capacity: PropTypes.shape({
    average: PropTypes.number,
    potential: PropTypes.number
  }).isRequired,
  segment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    variantString: PropTypes.string.isRequired
  }).isRequired
}

function mapStateToProps (state) {
  return {
    street: state.street,
    locale: state.locale.locale
  }
}

export default connect(mapStateToProps)(SegmentAnalytics)
