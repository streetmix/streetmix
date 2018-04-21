/**
 * GalleryStreetItem
 *
 * One street in the gallery
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import StreetName from '../streets/StreetName'
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
    dpi: PropTypes.number,
    intl: PropTypes.object
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
      THUMBNAIL_WIDTH * 2, THUMBNAIL_HEIGHT * 2, this.props.dpi, THUMBNAIL_MULTIPLIER, true, false, true, false, false)
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
    const message = this.props.intl.formatMessage({
      id: 'prompt.delete-street',
      defaultMessage: 'Are you sure you want to permanently delete {streetName}? This cannot be undone.'
    }, {
      streetName: street.name || this.props.intl.formatMessage({ id: 'street.default-name', defaultMessage: 'Unnamed St' })
    })

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
            width={THUMBNAIL_WIDTH * this.props.dpi * 2}
            height={THUMBNAIL_HEIGHT * this.props.dpi * 2}
            ref={(ref) => { this.thumbnailEl = ref }}
          />

          <StreetName name={this.props.street.name} />
          <span className="date">{formatDate(this.props.street.updatedAt)}</span>

          {!this.props.userId &&
            <span className="creator">
              {this.street.creatorId || this.props.intl.formatMessage({ id: 'users.anonymous', defaultMessage: 'Anonymous' })}
            </span>
          }

          {/* Only show delete links if you own the street */ }
          {this.props.allowDelete &&
            <button
              className="remove"
              title={this.props.intl.formatMessage({ id: 'gallery.delete-street-tooltip', defaultMessage: 'Delete street' })}
              onClick={this.onClickDeleteGalleryStreet}
            >
              ×
            </button>
          }
        </a>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    userId: state.gallery.userId,
    dpi: state.system.hiDpi
  }
}

export default injectIntl(connect(mapStateToProps)(GalleryStreetItem))
