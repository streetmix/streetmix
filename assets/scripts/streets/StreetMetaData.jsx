import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { IntlProvider, FormattedMessage } from 'react-intl'
import { formatDate } from '../util/date_format'
import { trackEvent } from '../app/event_tracking'
import { t } from '../app/locale'
import { getRemixOnFirstEdit } from './remix'
import { showGallery } from '../gallery/view'
import StreetWidth from './StreetWidth'
import Avatar from '../users/Avatar'
import { SHOW_DIALOG } from '../store/actions'

class StreetMetaData extends React.Component {
  static propTypes = {
    readOnly: PropTypes.bool,
    signedIn: PropTypes.bool.isRequired,
    userId: PropTypes.string,
    street: PropTypes.any,
    enableLocation: PropTypes.bool,
    showGeotagDialog: PropTypes.func,
    locale: PropTypes.object
  }

  static defaultProps = {
    userId: ''
  }

  constructor (props) {
    super(props)

    this.state = {
      street: this.props.street
    }
  }

  onClickGeotag = (event) => {
    event.preventDefault()
    if (!this.props.street.location) {
      trackEvent('Interaction', 'Clicked add location', null, null, true)
    } else {
      trackEvent('Interaction', 'Clicked existing location', null, null, true)
    }
    this.props.showGeotagDialog()
  }

  onClickAuthor = (event) => {
    if (event) {
      event.preventDefault()
    }
    showGallery(this.props.street.creatorId, false)
  }

  renderByline = (creatorId) => {
    return (
      <FormattedMessage
        id="users.byline"
        defaultMessage="by {user}"
        values={{
          user: (
            <React.Fragment key={creatorId}>
              <Avatar userId={creatorId} />
              <a href={'/' + creatorId} onClick={this.onClickAuthor}>{creatorId}</a>
            </React.Fragment>
          )
        }}
      />
    )
  }

  getGeotagText = () => {
    const { hierarchy } = this.props.street.location
    const unknownLabel = t('dialogs.geotag.unknown-location', 'Unknown location')
    let text = ''
    text = (hierarchy.locality) ? hierarchy.locality
      : (hierarchy.region) ? hierarchy.region
        : (hierarchy.neighbourhood) ? hierarchy.neighbourhood
          : unknownLabel
    if (text !== unknownLabel && hierarchy.country) {
      text = text + ', ' + hierarchy.country
    }
    return text
  }

  renderGeotag = (street, readOnly) => {
    const geotagText = (street.location) ? this.getGeotagText() : t('dialogs.geotag.add-location', 'Add location')
    const geolocation = (
      <span className="street-metadata-map">
        { (readOnly) ? geotagText : (
          <a onClick={this.onClickGeotag}> {geotagText} </a>
        ) }
      </span>
    )

    return (readOnly && !street.location) ? null : geolocation
  }

  render () {
    let author = null
    const creatorId = this.props.street.creatorId
    if (creatorId && (!this.props.signedIn || (creatorId !== this.props.userId))) {
      author = this.renderByline(creatorId)
    } else if (!creatorId && (this.props.signedIn || getRemixOnFirstEdit())) {
      author = t('users.byline', 'by {{user}}', { user: t('users.anonymous', 'Anonymous') })
    }

    const geolocation = (this.props.enableLocation) ? this.renderGeotag(this.props.street, this.props.readOnly) : null

    return (
      <IntlProvider
        locale={this.props.locale.locale}
        key={this.props.locale.locale}
        messages={this.props.locale.messages}
      >
        <div className="street-metadata">
          <StreetWidth readOnly={this.props.readOnly} />
          <span className="street-metadata-author">{author}</span>
          <span className="street-metadata-date">{formatDate(this.props.street.updatedAt)}</span>
          {geolocation}
        </div>
      </IntlProvider>
    )
  }
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId,
    enableLocation: state.flags.GEOLOCATION.value,
    locale: state.locale
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showGeotagDialog: () => {
      dispatch({
        type: SHOW_DIALOG,
        name: 'GEOTAG'
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaData)
