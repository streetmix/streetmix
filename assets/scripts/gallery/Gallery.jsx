/**
 * Gallery
 *
 * Displays a user's streets
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Scrollable from '../ui/Scrollable'
import Avatar from '../app/Avatar'
import GalleryStreetItem from './GalleryStreetItem'
import { switchGalleryStreet, repeatReceiveGalleryData } from './view'
import { URL_NEW_STREET, URL_NEW_STREET_COPY_LAST } from '../app/routing'
import { sendDeleteStreetToServer } from '../streets/xhr'
import { getStreet } from '../streets/data_model'
import { showError, ERRORS } from '../app/errors'
import { t } from '../app/locale'
import { deleteGalleryStreet } from '../store/actions/gallery'

function getStreetCountText (count) {
  let text
  if (!count) {
    text = t('gallery.street-count-none', 'No streets yet')
  } else {
    text = t('gallery.street-count', '{{count}} streets', { count })
  }
  return text
}

class Gallery extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    userId: PropTypes.string,
    mode: PropTypes.string,
    streets: PropTypes.array.isRequired,
    signInData: PropTypes.object,
    isSignedIn: PropTypes.bool
  }

  static defaultProps = {
    streets: [],
    signInData: {}
  }

  constructor (props) {
    super(props)

    this.state = {
      selected: null,
      preventHide: false,
      mode: this.props.mode,
      isOwnedByCurrentUser: this.props.isSignedIn && (this.props.userId === this.props.signInData.userId)
    }
  }

  componentDidMount () {
    this.scrollSelectedStreetIntoView()
  }

  componentWillReceiveProps (nextProps) {
    if (this.state.mode !== nextProps.mode) {
      this.setState({ mode: nextProps.mode })
    }

    // If gallery's userId changes, check state (via props) to see whether
    // it matches current signed in user.
    if (this.props.userId !== nextProps.userId) {
      this.setState({
        isOwnedByCurrentUser: nextProps.isSignedIn && (nextProps.userId === nextProps.signInData.userId)
      })
    }
  }

  componentDidUpdate () {
    this.scrollSelectedStreetIntoView()
  }

  componentDidCatch () {
    this.setState({ mode: 'ERROR' })
  }

  selectStreet = (streetId) => {
    this.setState({
      selected: streetId,
      preventHide: false
    })
    switchGalleryStreet(streetId)
  }

  deleteStreet = (streetId) => {
    let preventHide = false
    if (streetId === getStreet().id) {
      preventHide = true
      showError(ERRORS.NO_STREET, false)
    }

    sendDeleteStreetToServer(streetId)

    // Optimistic delete: don't re-fetch, just remove street from memory
    // and let the change in data store trigger a re-render
    this.setState({ selected: null, preventHide })
    this.props.dispatch(deleteGalleryStreet(streetId))
  }

  scrollSelectedStreetIntoView = () => {
    if (this.state.selected) {
      // selectedEl.scrollIntoView()
      // galleryEl.scrollTop = 0
    }
  }

  render () {
    let childElements

    switch (this.state.mode) {
      case 'SIGN_IN_PROMO':
        childElements = (
          <div className="gallery-sign-in-promo">
            <a href="/twitter-sign-in?redirectUri=/just-signed-in">Sign in with Twitter for your personal street gallery</a>
          </div>
        )
        break
      case 'LOADING':
        childElements = (
          <div className="gallery-loading">{t('msg.loading', 'Loading…')}</div>
        )
        break
      case 'ERROR':
        childElements = (
          <div className="gallery-error">
            <span>{t('gallery.fail', 'Failed to load the gallery.')}</span>
            <button className="gallery-try-again" onClick={repeatReceiveGalleryData}>{t('btn.try-again', 'Try again')}</button>
          </div>
        )
        break
      case 'GALLERY':
      default:
        let label

        // Displays user avatar and twitter link if showing a user's streets,
        // otherwise it shows the label "all streets"
        if (this.props.userId) {
          label = (
            <div className="gallery-label">
              <Avatar userId={this.props.userId} />
              <div className="gallery-user-id">
                {this.props.userId}
                <a
                  href={`https://twitter.com/${this.props.userId}`}
                  className="twitter-profile"
                  target="_blank"
                >
                  {t('gallery.twitter-link', 'Twitter profile')} »
                </a>
              </div>
            </div>
          )
        } else {
          label = <div className="gallery-label">{t('gallery.all', 'All streets')}</div>
        }

        // Applies a class to the containing element if no user ID is provided
        // (which displays all streets) or if the user ID provided is different
        // from a currently signed-in user
        let galleryClassName = 'gallery-streets-container'
        if (!this.props.userId || !this.state.isOwnedByCurrentUser) {
          galleryClassName += ' gallery-streets-container-full'
        }

        // Display these buttons for a user viewing their own gallery
        let buttons
        if (this.state.isOwnedByCurrentUser) {
          buttons = (
            <div className="gallery-user-buttons">
              <a className="button-like gallery-new-street" href={`/${URL_NEW_STREET}`} target="_blank">
                {t('btn.create', 'Create new street')}
              </a>
              <a className="button-like gallery-copy-last-street" href={`/${URL_NEW_STREET_COPY_LAST}`} target="_blank">
                {t('btn.copy', 'Make a copy')}
              </a>
            </div>
          )
        }

        const items = this.props.streets.map((item) => {
          const isSelected = this.state.selected === item.id
          return (
            <GalleryStreetItem
              key={item.id}
              street={item}
              selected={isSelected}
              handleSelect={this.selectStreet}
              handleDelete={this.deleteStreet}
              allowDelete={this.state.isOwnedByCurrentUser}
            />
          )
        })
        const streetCount = (this.props.userId) ? (
          <div className="street-count">{getStreetCountText(this.props.streets.length)}</div>
        ) : null

        childElements = (
          <div>
            {label}
            {streetCount}
            <div className={galleryClassName}>
              {buttons}
              <Scrollable className="streets">
                {items}
              </Scrollable>
            </div>
          </div>
        )
        break
    }

    return (
      <div id="gallery">
        {childElements}
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    visible: state.gallery.visible,
    userId: state.gallery.userId,
    mode: state.gallery.mode,
    streets: state.gallery.streets,
    signInData: state.user.signInData,
    isSignedIn: state.user.signedIn
  }
}

export default connect(mapStateToProps)(Gallery)
