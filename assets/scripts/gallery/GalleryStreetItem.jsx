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
import { formatDate } from '../util/date_format'
import { drawStreetThumbnail } from './thumbnail'
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
    handleDelete: PropTypes.func.isRequired,
    allowDelete: PropTypes.bool,
    hiDpi: PropTypes.number
  }

  static defaultProps = {
    selected: false,
    handleDelete: () => {}, // no-op
    allowDelete: false
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
    const message = t('prompt.delete-street', 'Are you sure you want to permanently delete {{streetName}}? This cannot be undone.', { streetName: street.name })

    if (window.confirm(message)) {
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
            width={THUMBNAIL_WIDTH * this.props.hiDpi * 2}
            height={THUMBNAIL_HEIGHT * this.props.hiDpi * 2}
            ref={(ref) => { this.thumbnailEl = ref }}
          />

          <StreetName name={this.props.street.name} />
          <span className="date">{formatDate(this.props.street.updatedAt)}</span>

          {(() => {
            if (!this.props.userId) {
              return (
                <span className="creator">{this.street.creatorId || t('users.anonymous', 'Anonymous')}</span>
              )
            }
          })()}

          {(() => {
            // Only show delete links if you own the street
            if (this.props.allowDelete) {
              return (
                <button
                  className="remove"
                  title={t('gallery.delete-street-tooltip', 'Delete street')}
                  onClick={this.onClickDeleteGalleryStreet}
                >
                  ×
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
    userId: state.gallery.userId,
    hiDpi: state.system.hiDpi
  }
}

export default connect(mapStateToProps)(GalleryStreetItem)
