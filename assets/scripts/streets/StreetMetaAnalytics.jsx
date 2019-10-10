import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { getStreetCapacity, formatCapacity } from '../util/street_analytics'
import { showDialog } from '../store/actions/dialogs'

StreetMetaAnalytics.propTypes = {
  locale: PropTypes.string,
  updatedAt: PropTypes.string,
  street: PropTypes.shape({}),
  showDialog: PropTypes.func
}

function StreetMetaAnalytics (props) {
  const { locale, updatedAt, street, showDialog } = props

  if (!updatedAt) return null

  const averageTotal = getStreetCapacity(street, locale).averageTotal

  // For zero capacity, don't display anything
  return (Number.parseInt(averageTotal, 10) > 0) && (
    <span className="street-metadata-author">
      <a href="#" onClick={() => showDialog('ANALYTICS')}>
        <FormattedMessage
          id="capacity.ppl-per-hr"
          defaultMessage="{capacity} people/hr"
          values={{ capacity: formatCapacity(averageTotal) }}
        />
      </a>
    </span>
  )
}

const mapStateToProps = (state) => ({
  updatedAt: state.street.updatedAt,
  street: state.street,
  locale: state.locale.locale,
  showDialog: PropTypes.func
})

const mapDispatchToProps = {
  showDialog
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaAnalytics)
