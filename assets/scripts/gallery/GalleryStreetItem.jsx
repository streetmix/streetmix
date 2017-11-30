/**
 * GalleryStreetItem
 *
 * One street in the gallery
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import StreetName from '../streets/StreetName'
import { t } from '../app/locale'
import { msg } from '../app/messages'
import { system } from '../preinit/system_capabilities'
import { formatDate } from '../util/date_format'
import { drawStreetThumbnail } from './thumbnail'
import { getSignInData, isSignedIn } from '../users/authentication'
import { getStreetUrl } from '../streets/data_model'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

class GalleryStreetItem extends React.Component {
  static propTypes = {
    userId: PropTypes.string,
    selected: PropTypes.bool.isRequired,
    street: PropTypes.object.isRequired,
    handleSelect: PropTypes.func.isRequired,
    handleDelete: PropTypes.func.isRequired
  }

  static defaultProps = {
    selected: false
  }

  componentDidMount () {
    this.drawCanvas()
  }

  drawCanvas = () => {
    const ctx = this.thumbnailEl.getContext('2d')
    if (!this.props.street.data) {
      console.log(this.props.street)
    }
    drawStreetThumbnail(ctx, this.props.street.data.street,
      THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, THUMBNAIL_MULTIPLIER, true, false, true, false, false)
  }

  onClickGalleryStreet = (event) => {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) return
    this.props.handleSelect(this.props.street.id)
  }

  onClickDeleteGalleryStreet = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const street = this.props.street

    // TODO escape name
    if (window.confirm(msg('PROMPT_DELETE_STREET', { name: street.name }))) {
      this.props.handleDelete(street.id)
    }
  }

  render () {
    const className = (this.props.selected) ? 'selected' : ''

    return (
      <div className="gallery-street-item">
        <a
          href={getStreetUrl(this.props.street)}
          onClick={this.onClickGalleryStreet}
          className={className}
        >
          <canvas
            width={THUMBNAIL_WIDTH * system.hiDpi * 2}
            height={THUMBNAIL_HEIGHT * system.hiDpi * 2}
            ref={(ref) => { this.thumbnailEl = ref }}
          />

          <StreetName name={this.props.street.name} />
          <span className="date">{formatDate(this.props.street.updatedAt)}</span>

          {(() => {
            if (!this.props.userId) {
              return (
                <span className="creator">{this.street.creatorId || msg('USER_ANONYMOUS')}</span>
              )
            }
          })()}

          {(() => {
            // Only show delete links if you own the street
            if (isSignedIn() && (this.props.street.creatorId === getSignInData().userId)) {
              return (
                <button
                  className="remove"
                  title={t('gallery.delete-street-tooltip', 'Delete street')}
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

function mapStateToProps (state) {
  return {
    userId: state.gallery.userId
  }
}

export default connect(mapStateToProps)(GalleryStreetItem)
