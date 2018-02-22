import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
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
    showGeolocateDialog: PropTypes.func
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

  onClickGeolocate = (event) => {
    event.preventDefault()
    if (!this.props.street.location) {
      trackEvent('Interaction', 'Clicked add location', null, null, true)
    } else {
      trackEvent('Interaction', 'Clicked existing location', null, null, true)
    }
    this.props.showGeolocateDialog()
  }

  onClickAuthor = (event) => {
    if (event) {
      event.preventDefault()
    }
    showGallery(this.props.street.creatorId, false)
  }

  renderByline = (creatorId) => {
    // i18next automatically interpolates {{variables}}, but in this case
    // we want to supplant the string with a React component. i18next is
    // only able to output strings, but we do not want it to convert a
    // component to a string. To get around this, we will get the string,
    // split it into an array of strings, then replace one of the items
    // with the React component. This array is renderable by React.

    // Why go through all this trouble instead of just rendering the different
    // parts of the byline separately? It's because we don't necessarily
    // know what comes first, the "by" (or translated equivalent) or the
    // user name and Avatar. Word order _may_ differ by locale.

    // We first get the translated string as usual, but i18next will want
    // to interpolate {{user}}, and if we ignore it, it gets replaced with
    // an empty string. We want to preserve the {{user}} in the string, so
    // we tell it to supplant it with itself.
    const string = t('users.byline', 'by {{user}}', { user: '{{user}}' })

    // Next, split the string into an array of parts. One of the items
    // in the array will just be the string `{{user}}`.
    const split = string.split(/({{user}})/)

    // For any item in the array that matches `{{user}}`, replace that
    // item with a React fragment. This allows the render() function to
    // render the "string" with a React component inside of it.
    return split.map((value) => {
      if (value === '{{user}}') {
        return (
          <React.Fragment key={creatorId}>
            <Avatar userId={creatorId} />
            <a href={'/' + creatorId} onClick={this.onClickAuthor}>{creatorId}</a>
          </React.Fragment>
        )
      } else return value
    })
  }

  getGeolocationText = () => {
    const { hierarchy } = this.props.street.location
    let text = ''
    text = (hierarchy.locality) ? hierarchy.locality
      : (hierarchy.region) ? hierarchy.region
        : (hierarchy.neighbourhood) ? hierarchy.neighbourhood
          : 'Unknown Location'
    if (text !== 'Unknown Location' && hierarchy.country) {
      text = text + ', ' + hierarchy.country
    }
    return text
  }

  render () {
    let author = null
    const creatorId = this.props.street.creatorId
    if (creatorId && (!this.props.signedIn || (creatorId !== this.props.userId))) {
      author = this.renderByline(creatorId)
    } else if (!creatorId && (this.props.signedIn || getRemixOnFirstEdit())) {
      author = t('users.byline', 'by {{user}}', { user: t('users.anonymous', 'Anonymous') })
    }

    let geolocationText = t('dialogs.geolocate.add-location', 'Add location')
    if (this.props.street.location) {
      geolocationText = this.getGeolocationText()
    }

    const geolocation = (this.props.enableLocation) ? (
      <span>
        <a className="street-metadata-map" onClick={this.onClickGeolocate}>
          <u>{geolocationText}</u>
        </a>
      </span>
    ) : null

    return (
      <div className="street-metadata">
        <StreetWidth readOnly={this.props.readOnly} />
        <span className="street-metadata-author">{author}</span>
        <span className="street-metadata-date">{formatDate(this.props.street.updatedAt)}</span>
        {geolocation}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    signedIn: state.user.signedIn,
    userId: state.user.signInData && state.user.signInData.userId,
    enableLocation: state.flags.GEOLOCATION.value
  }
}

function mapDispatchToProps (dispatch) {
  return {
    showGeolocateDialog: () => {
      dispatch({
        type: SHOW_DIALOG,
        name: 'GEOLOCATE'
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(StreetMetaData)
