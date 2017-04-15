/**
 * GalleryStreetItem
 *
 * One street in the gallery
 */
import React from 'react'
import { connect } from 'react-redux'
import StreetName from '../streets/StreetName'
import { msg } from '../app/messages'
import { system } from '../preinit/system_capabilities'
import { formatDate } from '../util/date_format'
import { switchGalleryStreet } from './view'
import { drawStreetThumbnail } from './thumbnail'
import { getSignInData, isSignedIn } from '../users/authentication'
import { sendDeleteStreetToServer } from '../streets/xhr'
import { getStreet, getStreetUrl } from '../streets/data_model'
import { showError, ERRORS } from '../app/errors'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

class GalleryStreetItem extends React.Component {
  constructor (props) {
    super(props)

    this.onClickGalleryStreet = this.onClickGalleryStreet.bind(this)
  }

  drawCanvas () {
    const ctx = this.thumbnailEl.getContext('2d')
    drawStreetThumbnail(ctx, this.props.street.data.street,
      THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, THUMBNAIL_MULTIPLIER, true, false, true, false, false)
  }

  onClickGalleryStreet (event) {
    if (event.shiftKey || event.ctrlKey || event.metaKey) {
      return
    }

    switchGalleryStreet(this.props.street.id)

    event.preventDefault()
  }

  onClickDeleteGalleryStreet (event) {
    const name = this.props.street.name

    // TODO escape name
    if (window.confirm(msg('PROMPT_DELETE_STREET', { name: name }))) {
      if (this.props.street.id === getStreet().id) {
        // TODO: affect gallery state
        // galleryState.noStreetSelected = true
        showError(ERRORS.NO_STREET, false)
      }

      sendDeleteStreetToServer(this.props.street.id)

      // Instead, remove data from memory, and trigger re-render from data
      // removeElFromDOM(el.parentNode)
      // updateGalleryStreetCount()
    }

    event.preventDefault()
    event.stopPropagation()
  }

  render () {
    const className = (this.props.selected) ? 'selected' : ''

    return (
      <div className='gallery-street-item'>
        <a
          href={getStreetUrl(this.props.street)}
          data-street-id={this.props.street.id}
          onClick={this.onClickGalleryStreet}
          className={className}
        >
          <canvas
            width={THUMBNAIL_WIDTH * system.hiDpi * 2}
            height={THUMBNAIL_HEIGHT * system.hiDpi * 2}
            ref={(ref) => { this.thumbnailEl = ref }}
          />

          <StreetName name={this.props.street.name} />

          <span className='date'>
            {formatDate(this.props.street.updatedAt)}
          </span>

          {(() => {
            if (!this.props.userId) {
              return (
                <span className='creator'>{this.street.creatorId || msg('USER_ANONYMOUS')}</span>
              )
            }
          })()}

          {(() => {
            // Only show delete links if you own the street
            if (isSignedIn() && (this.props.street.creatorId === getSignInData().userId)) {
              return (
                <button
                  className='remove'
                  title={msg('TOOLTIP_DELETE_STREET')}
                  onClick={this.onClickDeleteGalleryStreet}
                >
                  {msg('UI_GLYPH_X')}
                </button>
              )
            }
          })()}

        </a>
      </div>
    )
  }
}

GalleryStreetItem.propTypes = {
  userId: React.PropTypes.string,
  selected: React.PropTypes.bool,
  street: React.PropTypes.object
}

function mapStateToProps (state) {
  return {
    userId: state.gallery.userId
  }
}

export default connect(mapStateToProps)(GalleryStreetItem)
